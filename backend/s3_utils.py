import io
import os
import uuid

import boto3
from fastapi import UploadFile
from pdf2image import convert_from_bytes
from config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME

# On Windows set POPPLER_PATH env var pointing to the bin folder.
# On Linux with poppler-utils installed this stays None (auto-detected).
POPPLER_PATH = os.getenv("POPPLER_PATH") or None

s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
)


def validate_s3_config() -> None:
    missing_values = [
        name
        for name, value in {
            "AWS_ACCESS_KEY_ID": AWS_ACCESS_KEY_ID,
            "AWS_SECRET_ACCESS_KEY": AWS_SECRET_ACCESS_KEY,
            "AWS_REGION": AWS_REGION,
            "AWS_S3_BUCKET_NAME or AWS_S3_BUCKET": AWS_S3_BUCKET_NAME,
        }.items()
        if not value
    ]

    if missing_values:
        raise ValueError(f"Missing S3 configuration: {', '.join(missing_values)}")


def upload_file_to_s3(file: UploadFile, folder_name: str) -> str:
    validate_s3_config()

    if not file.filename or "." not in file.filename:
        raise ValueError("Uploaded file must have a file extension")

    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    unique_filename = f"{folder_name}/{uuid.uuid4()}.{file_extension}"

    s3_client.upload_fileobj(
        file.file,
        AWS_S3_BUCKET_NAME,
        unique_filename,
        ExtraArgs={"ContentType": file.content_type or "application/octet-stream"},
    )
    return f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"


def convert_pdf_to_images_and_upload(file: UploadFile) -> tuple[str, int]:
    validate_s3_config()

    file_bytes = file.file.read()
    images = convert_from_bytes(file_bytes, dpi=150, fmt="jpeg", poppler_path=POPPLER_PATH)

    folder_id = str(uuid.uuid4())
    base_key = f"pdf_images/{folder_id}"

    for i, image in enumerate(images, start=1):
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85, optimize=True)
        buffer.seek(0)
        s3_client.upload_fileobj(
            buffer,
            AWS_S3_BUCKET_NAME,
            f"{base_key}/page_{i}.jpg",
            ExtraArgs={"ContentType": "image/jpeg"},
        )

    base_url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{base_key}/"
    return base_url, len(images)
