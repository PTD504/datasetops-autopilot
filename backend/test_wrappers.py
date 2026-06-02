import os
from backend.wrappers.qwen_client import QwenClient
from backend.wrappers.oss_client import AlibabaOSSClient

def test_qwen_mock():
    client = QwenClient()
    response = client.generate_json("Create a plan for this benchmark request")
    assert "goal" in response
    assert response["language"] == "English"

    response = client.generate_json("Evaluate this sample")
    print(response) # see what the mock returns
    assert response["decision"] == "pass"

def test_oss_local():
    client = AlibabaOSSClient()

    # Create test file
    test_file = "test.txt"
    with open(test_file, "w") as f:
        f.write("test content")

    url = client.upload_file("test_upload.txt", test_file)
    assert "test_upload.txt" in url

    # Test signed url
    signed = client.get_signed_url("test_upload.txt")
    assert "test_upload.txt" in signed

    # Cleanup
    os.remove(test_file)

if __name__ == "__main__":
    test_qwen_mock()
    test_oss_local()
    print("Wrappers tests passed")
