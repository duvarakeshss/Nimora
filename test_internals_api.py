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

def test_internals_api(rollno, password, server_url="http://localhost:8000"):
    """
    Test the Internal Marks API by sending encoded rollno and password
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
        print(f"Testing Internal Marks API for roll number: {rollno}")
        print("=" * 50)
        
        response = requests.post(f"{server_url}/internals", json=payload)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            internals_data = response.json()
            
            if "internals" in internals_data and internals_data["internals"]:
                print("\n✅ Internal Marks Data Retrieved Successfully!")
                print(f"Message: {internals_data.get('message', 'N/A')}")
                print(f"Number of courses: {len(internals_data['internals'])}")
                
                print("\n📊 Course-wise Internal Marks:")
                print("-" * 80)
                
                for i, course_data in enumerate(internals_data["internals"], 1):
                    if len(course_data) > 0:
                        course_name = course_data[0]
                        # Extract marks (skip course name and last element)
                        marks = course_data[1:-1] if len(course_data) > 2 else course_data[1:]
                        
                        print(f"\n{i}. Course: {course_name}")
                        print(f"   Assessments: {marks}")
                        
                        # Calculate total and average if marks are available
                        valid_marks = []
                        for mark in marks:
                            try:
                                if mark and mark not in ['*', '', ' ']:
                                    valid_marks.append(float(mark))
                            except (ValueError, TypeError):
                                continue
                        
                        if valid_marks:
                            total_marks = sum(valid_marks)
                            average_mark = total_marks / len(valid_marks)
                            max_possible = len(valid_marks) * 50  # Assuming each assessment is out of 50
                            percentage = (total_marks / max_possible) * 100 if max_possible > 0 else 0
                            
                            print(f"   📈 Statistics:")
                            print(f"      - Total Marks: {total_marks}/{max_possible}")
                            print(f"      - Average: {average_mark:.2f}/50")
                            print(f"      - Percentage: {percentage:.1f}%")
                        else:
                            print(f"   📈 Statistics: No valid marks available")
                
                # Overall summary
                all_marks = []
                total_courses = 0
                
                for course_data in internals_data["internals"]:
                    if len(course_data) > 1:
                        total_courses += 1
                        marks = course_data[1:-1] if len(course_data) > 2 else course_data[1:]
                        for mark in marks:
                            try:
                                if mark and mark not in ['*', '', ' ']:
                                    all_marks.append(float(mark))
                            except (ValueError, TypeError):
                                continue
                
                if all_marks:
                    print("\n" + "=" * 50)
                    print("📊 OVERALL SUMMARY")
                    print("=" * 50)
                    print(f"Total Courses: {total_courses}")
                    print(f"Total Assessments: {len(all_marks)}")
                    print(f"Overall Average: {sum(all_marks)/len(all_marks):.2f}/50")
                    print(f"Overall Percentage: {(sum(all_marks)/(len(all_marks)*50))*100:.1f}%")
                    print(f"Highest Mark: {max(all_marks)}/50")
                    print(f"Lowest Mark: {min(all_marks)}/50")
                
            else:
                print("\n⚠️  No internal marks data found in response")
                print("Full Response:")
                print(json.dumps(internals_data, indent=2))
                
        else:
            print(f"\n❌ Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request failed: {e}")
    except json.JSONDecodeError as e:
        print(f"\n❌ Failed to parse JSON response: {e}")
        print(f"Raw response: {response.text}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    print("🎓 NIMORA - Internal Marks API Test")
    print("=" * 50)
    
    # Get user input
    rollno = input("Enter your roll number: ").strip()
    password = input("Enter your password: ").strip()
    
    if not rollno or not password:
        print("❌ Error: Roll number and password are required!")
        exit(1)
    
    # Optional: custom server URL
    custom_url = input("Enter server URL (press Enter for default http://localhost:8000): ").strip()
    server_url = custom_url if custom_url else "http://localhost:8000"
    
    print(f"\n🔍 Testing with server: {server_url}")
    
    # Test the API
    test_internals_api(rollno, password, server_url)