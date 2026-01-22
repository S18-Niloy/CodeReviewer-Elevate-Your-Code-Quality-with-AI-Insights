import requests
import sys
import json
from datetime import datetime

class CodeReviewerAPITester:
    def __init__(self, base_url="http://127.0.0.1:8001"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_review_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f" Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f" Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f" Failed - Error: {str(e)}")
            return False, {}

    def test_analyze_code(self):
        """Test code analysis endpoint"""
        test_code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# This is inefficient recursive implementation
result = fibonacci(10)
print(result)
"""
        
        success, response = self.run_test(
            "Code Analysis",
            "POST",
            "reviews/analyze",
            200,
            data={
                "code": test_code,
                "language": "python",
                "filename": "fibonacci.py"
            },
            timeout=60  # AI analysis takes time
        )
        
        if success and 'id' in response:
            self.created_review_id = response['id']
            print(f"   Created review ID: {self.created_review_id}")
            print(f"   Overall score: {response.get('overall_score', 'N/A')}")
            print(f"   Results count: {len(response.get('results', []))}")
            return True
        return False

    def test_get_reviews(self):
        """Test get all reviews endpoint"""
        success, response = self.run_test(
            "Get All Reviews",
            "GET",
            "reviews",
            200
        )
        
        if success:
            reviews_count = len(response) if isinstance(response, list) else 0
            print(f"   Found {reviews_count} reviews")
            return True
        return False

    def test_get_single_review(self):
        """Test get single review endpoint"""
        if not self.created_review_id:
            print(" Skipping single review test - no review ID available")
            return False
            
        success, response = self.run_test(
            "Get Single Review",
            "GET",
            f"reviews/{self.created_review_id}",
            200
        )
        
        if success:
            print(f"   Review language: {response.get('language', 'N/A')}")
            print(f"   Review filename: {response.get('filename', 'N/A')}")
            print(f"   Has code: {'code' in response}")
            return True
        return False

    def test_delete_review(self):
        """Test delete review endpoint"""
        if not self.created_review_id:
            print(" Skipping delete test - no review ID available")
            return False
            
        success, response = self.run_test(
            "Delete Review",
            "DELETE",
            f"reviews/{self.created_review_id}",
            200
        )
        
        if success:
            print(f"   Delete message: {response.get('message', 'N/A')}")
            return True
        return False

    def test_invalid_endpoints(self):
        """Test error handling"""
        print("\n Testing Error Handling...")
        
        # Test non-existent review
        success, _ = self.run_test(
            "Non-existent Review",
            "GET",
            "reviews/non-existent-id",
            404
        )
        
        # Test invalid analysis data
        success2, _ = self.run_test(
            "Invalid Analysis Data",
            "POST",
            "reviews/analyze",
            422,  # Validation error
            data={"invalid": "data"}
        )
        
        return success and success2

def main():
    print(" Starting Code Reviewer API Tests")
    print("=" * 50)
    
    tester = CodeReviewerAPITester()
    
    # Run all tests
    tests = [
        tester.test_analyze_code,
        tester.test_get_reviews,
        tester.test_get_single_review,
        tester.test_delete_review,
        tester.test_invalid_endpoints
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f" Test failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f" Tests completed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f" Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print(" Backend API tests PASSED!")
        return 0
    else:
        print(" Backend API tests have issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())