import io
import uuid

import boto3
import pikepdf
from fastapi import UploadFile
from config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME

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


def _linearize_pdf(pdf_bytes: bytes) -> bytes:
    # Reorganizes PDF so page 1 data is at the start of the file.
    # PDF.js can then render page 1 from the first network chunk
    # instead of waiting for the entire file to download.
    try:
        output = io.BytesIO()
        with pikepdf.open(io.BytesIO(pdf_bytes)) as pdf:
            pdf.save(output, linearize=True)
        output.seek(0)
        return output.read()
    except Exception:
        return pdf_bytes  # fall back to original if linearization fails


def upload_file_to_s3(file: UploadFile, folder_name: str) -> str:
    validate_s3_config()

    if not file.filename or "." not in file.filename:
        raise ValueError("Uploaded file must have a file extension")

    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    unique_filename = f"{folder_name}/{uuid.uuid4()}.{file_extension}"

    file_bytes = file.file.read()
    if file_extension == "pdf":
        file_bytes = _linearize_pdf(file_bytes)

    s3_client.upload_fileobj(
        io.BytesIO(file_bytes),
        AWS_S3_BUCKET_NAME,
        unique_filename,
        ExtraArgs={"ContentType": file.content_type or "application/octet-stream"},
    )
    file_url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
    return file_url
