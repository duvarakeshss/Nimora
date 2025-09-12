import requests
import base64
import json
import os

# Payload security utilities (copied from app.py)
class PayloadSecurity:
    @staticmethod
    def encode_payload(data):
        try:
            # Get salt from environment or default
            salt = os.environ.get("PAYLOAD_SALT", "nimora_secure_payload_2025")

            # Create JSON string
            json_string = json.dumps(data)

            # First base64 encode
            first_encoded = base64.b64encode(json_string.encode('utf-8')).decode('utf-8')

            # Reverse and append salt
            reversed_encoded = first_encoded[::-1] + salt

            # Second base64 encode
            final_encoded = base64.b64encode(reversed_encoded.encode('utf-8')).decode('utf-8')

            return final_encoded
        except Exception as e:
            print(f"Error encoding payload: {e}")
            return None

def test_cgpa_api(rollno, password, server_url="http://localhost:8000"):
    """
    Test the CGPA API by sending encoded rollno and password
    """
    # Prepare the data
    data = {
        "rollno": rollno,
        "password": password
    }

    # Encode the payload
    encoded_data = PayloadSecurity.encode_payload(data)
    if not encoded_data:
        print("Failed to encode payload")
        return

    # Prepare the request payload
    payload = {
        "data": encoded_data
    }

    # Make the POST request
    try:
        response = requests.post(f"{server_url}/cgpa", json=payload)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            cgpa_data = response.json()
            print("CGPA Data:")
            print(json.dumps(cgpa_data, indent=2))
        else:
            print(f"Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # Get user input
    rollno = input("Enter your roll number: ")
    password = input("Enter your password: ")

    # Test the API
    test_cgpa_api(rollno, password)