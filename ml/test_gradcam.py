"""
Test script to verify Grad-CAM implementation
Run this after starting the FastAPI server with: uvicorn app:app --reload
"""
import requests
import json
import base64
from PIL import Image
import io

# Test the /predict endpoint
def test_predict_with_gradcam(image_path):
    url = "http://localhost:8000/predict"
    
    with open(image_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        result = response.json()
        print("✓ Prediction successful!")
        print(f"  Plant: {result['plant']}")
        print(f"  Disease: {result['disease']}")
        print(f"  Confidence: {result['confidence']}%")
        print(f"  Treatments: {len(result['treatments'])} available")
        
        if result.get('heatmap'):
            print("✓ Grad-CAM heatmap generated!")
            
            # Optionally save the heatmap
            heatmap_data = base64.b64decode(result['heatmap'])
            heatmap_image = Image.open(io.BytesIO(heatmap_data))
            heatmap_image.save("gradcam_output.png")
            print("  Heatmap saved as 'gradcam_output.png'")
        else:
            print("✗ No heatmap in response")
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    # Replace with your test image path
    test_image = "test_plant_image.jpg"
    
    print("Testing Grad-CAM implementation...")
    print("-" * 50)
    
    try:
        test_predict_with_gradcam(test_image)
    except FileNotFoundError:
        print(f"✗ Test image not found: {test_image}")
        print("  Please provide a valid plant disease image path")
    except Exception as e:
        print(f"✗ Error: {e}")
