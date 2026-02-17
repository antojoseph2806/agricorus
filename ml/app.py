import json
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import io
import cv2
import base64
import traceback
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('gradcam_debug.log')
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load treatment data first to get number of classes
with open("treatment_data.json") as f:
    treatment_data = json.load(f)

num_classes = len(treatment_data)

# Build model architecture matching Colab exactly
base_model = tf.keras.applications.MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)
base_model.trainable = False

model = tf.keras.models.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Build the model by calling it once with a dummy input
dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
_ = model(dummy_input)
logger.info("Model built successfully")

# Load weights from the saved model
try:
    model.load_weights("plant_disease_model.h5")
    logger.info("Model weights loaded successfully from .h5 file!")
except:
    try:
        model.load_weights("plant_disease_model.keras")
        logger.info("Model weights loaded from .keras file!")
    except Exception as e:
        logger.warning(f"Could not load weights: {e}")
        logger.warning("Using ImageNet weights only - predictions will be incorrect!")

# Get class names (must match training order)
class_names = sorted(treatment_data.keys())

IMG_SIZE = 224

def generate_gradcam(model, img_array, predicted_index):
    """
    Generate Grad-CAM heatmap for the predicted class.
    Uses the last Conv2D layer from MobileNetV2 base model.
    """
    # Get the base model (MobileNetV2)
    base_model = model.layers[0]
    
    # For MobileNetV2, the last conv layer is 'Conv_1'
    last_conv_layer_name = 'Conv_1'
    
    logger.info(f"Using layer: {last_conv_layer_name}")
    
    # Since model is Sequential and has been built, we can now access its input/output
    # Create a model that maps input to both the conv layer and final output
    last_conv_layer_model = tf.keras.models.Model(
        base_model.input,
        base_model.get_layer(last_conv_layer_name).output
    )
    
    # Create classifier model (everything after base_model)
    classifier_input = tf.keras.Input(shape=last_conv_layer_model.output.shape[1:])
    x = classifier_input
    
    # Apply remaining base_model layers after Conv_1
    conv_1_index = [i for i, layer in enumerate(base_model.layers) if layer.name == last_conv_layer_name][0]
    for layer in base_model.layers[conv_1_index + 1:]:
        x = layer(x)
    
    # Apply Sequential model's additional layers
    x = model.layers[1](x)  # GlobalAveragePooling2D
    x = model.layers[2](x)  # Dense(256)
    x = model.layers[3](x, training=False)  # Dropout
    x = model.layers[4](x)  # Dense(num_classes)
    
    classifier_model = tf.keras.models.Model(classifier_input, x)
    
    # Get conv layer output
    with tf.GradientTape() as tape:
        conv_outputs = last_conv_layer_model(img_array)
        tape.watch(conv_outputs)
        predictions = classifier_model(conv_outputs)
        loss = predictions[:, predicted_index]
    
    # Compute gradients
    grads = tape.gradient(loss, conv_outputs)
    
    # Global average pooling of gradients
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    
    # Weight the feature map
    conv_outputs = conv_outputs[0].numpy()
    pooled_grads = pooled_grads.numpy()
    
    for i in range(pooled_grads.shape[0]):
        conv_outputs[:, :, i] *= pooled_grads[i]
    
    # Create heatmap
    heatmap = np.mean(conv_outputs, axis=-1)
    
    # Normalize
    heatmap = np.maximum(heatmap, 0)
    if np.max(heatmap) != 0:
        heatmap /= np.max(heatmap)
    
    # Resize to 224x224
    heatmap = cv2.resize(heatmap, (224, 224))
    
    return heatmap

def overlay_heatmap_on_image(heatmap, original_image, alpha=0.4):
    """
    Overlay the Grad-CAM heatmap on the original image.
    Returns base64 encoded image.
    """
    # Convert heatmap to RGB
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    
    # Convert PIL image to numpy array
    original_array = np.array(original_image)
    
    # Ensure both images are the same size
    if original_array.shape[:2] != heatmap_colored.shape[:2]:
        original_array = cv2.resize(original_array, (224, 224))
    
    # Overlay heatmap on original image
    overlay = cv2.addWeighted(original_array, 1 - alpha, heatmap_colored, alpha, 0)
    
    # Convert to PIL Image
    overlay_image = Image.fromarray(overlay)
    
    # Convert to base64
    buffered = io.BytesIO()
    overlay_image.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    return img_base64

@app.get("/")
async def root():
    return {
        "status": "Plant Disease Detection API is running",
        "endpoints": {
            "/predict": "POST - Upload image for disease prediction with Grad-CAM",
            "/health": "GET - Check model and dependencies status"
        }
    }

@app.get("/health")
async def health_check():
    """Check if model and dependencies are working"""
    try:
        # Check model
        model_loaded = model is not None
        base_model = model.layers[0]
        
        # Try to get Conv_1 layer
        try:
            conv_1_layer = base_model.get_layer('Conv_1')
            conv_1_found = True
        except:
            conv_1_found = False
        
        return {
            "status": "healthy",
            "model_loaded": model_loaded,
            "num_classes": num_classes,
            "base_model_type": type(base_model).__name__,
            "conv_1_layer_found": conv_1_found,
            "opencv_available": cv2 is not None,
            "tensorflow_version": tf.__version__,
            "numpy_version": np.__version__
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))

    img_array = np.array(image)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions)
    confidence = float(np.max(predictions) * 100)

    label = class_names[predicted_index]
    
    # Generate Grad-CAM heatmap
    try:
        logger.info(f"Starting Grad-CAM generation for {label}")
        heatmap = generate_gradcam(model, img_array, predicted_index)
        logger.info("Heatmap generated, creating overlay")
        heatmap_base64 = overlay_heatmap_on_image(heatmap, image)
        logger.info(f"SUCCESS: Grad-CAM generated for {label}, length: {len(heatmap_base64)}")
    except Exception as e:
        logger.error(f"ERROR generating Grad-CAM: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        heatmap_base64 = None

    return {
        "plant": label.split("___")[0],
        "disease": label.split("___")[1],
        "confidence": round(confidence, 2),
        "treatments": treatment_data[label]["treatments"],
        "heatmap": heatmap_base64
    }