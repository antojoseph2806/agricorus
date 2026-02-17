import requests
import json
from PIL import Image
import io

# Test the API with a simple test image
def test_predict_api():
    # Create a simple test image (224x224 RGB)
    test_image = Image.new('RGB', (224, 224), color='green')
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    test_image.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    # Send request
    files = {'file': ('test.jpg', img_byte_arr, 'image/jpeg')}
    response = requests.post('http://127.0.0.1:8000/predict', files=files)
    
    print("Status Code:", response.status_code)
    print("\nResponse JSON:")
    result = response.json()
    print(json.dumps(result, indent=2))
    
    # Check if heatmap is present
    if result.get('heatmap'):
        print("\n[SUCCESS] Heatmap generated successfully!")
        print(f"Heatmap length: {len(result['heatmap'])} characters")
    else:
        print("\n[FAILED] Heatmap is null")

if __name__ == "__main__":
    test_predict_api()
