import os
import oss2
import logging
from typing import Optional
from backend.core.config import settings

logger = logging.getLogger(__name__)

class AlibabaOSSClient:
    def __init__(self):
        self.use_local = settings.STORAGE_MODE == "local" or not settings.ALIBABA_CLOUD_ACCESS_KEY_ID

        if self.use_local:
            self.local_dir = settings.LOCAL_STORAGE_DIR
            os.makedirs(self.local_dir, exist_ok=True)
            logger.info(f"Using Local Storage fallback at {self.local_dir}")
        else:
            auth = oss2.Auth(settings.ALIBABA_CLOUD_ACCESS_KEY_ID, settings.ALIBABA_CLOUD_ACCESS_KEY_SECRET)
            self.bucket = oss2.Bucket(auth, settings.ALIBABA_CLOUD_OSS_ENDPOINT, settings.ALIBABA_CLOUD_OSS_BUCKET)
            self.endpoint_url = f"https://{settings.ALIBABA_CLOUD_OSS_BUCKET}.{settings.ALIBABA_CLOUD_OSS_ENDPOINT}"
            logger.info(f"Using Alibaba Cloud OSS: {settings.ALIBABA_CLOUD_OSS_BUCKET}")

    def upload_file(self, object_name: str, file_path: str) -> str:
        """
        Uploads a file and returns its URL.
        """
        if self.use_local:
            dest_path = os.path.join(self.local_dir, object_name)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)

            # Simple copy
            with open(file_path, 'rb') as src, open(dest_path, 'wb') as dst:
                dst.write(src.read())
            return f"file://{os.path.abspath(dest_path)}"
        else:
            try:
                self.bucket.put_object_from_file(object_name, file_path)
                return f"{self.endpoint_url}/{object_name}"
            except Exception as e:
                logger.error(f"Failed to upload {file_path} to OSS: {e}")
                raise

    def download_file(self, object_name: str, dest_path: str) -> None:
        """
        Downloads a file from storage.
        """
        if self.use_local:
            src_path = os.path.join(self.local_dir, object_name)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            with open(src_path, 'rb') as src, open(dest_path, 'wb') as dst:
                dst.write(src.read())
        else:
            self.bucket.get_object_to_file(object_name, dest_path)

    def get_signed_url(self, object_name: str, expires: int = 3600) -> str:
        if self.use_local:
             return f"file://{os.path.abspath(os.path.join(self.local_dir, object_name))}"
        else:
            return self.bucket.sign_url('GET', object_name, expires)
