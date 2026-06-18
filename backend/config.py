import os

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:lalit@localhost:5432/mysticindia",
)

engine = create_engine(db_url)

Session = sessionmaker(autoflush=False, bind=engine, autocommit=False)



