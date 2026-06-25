import os
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
load_dotenv()
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME") or os.getenv("AWS_S3_BUCKET")
db_url = os.getenv( "DATABASE_URL",)

engine = create_engine(db_url)

Session = sessionmaker(autoflush=False, bind=engine, autocommit=False)


