from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy import ForeignKey

Base = declarative_base()


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    mobile_no = Column(String)
    password_hash = Column(String)
    role = Column(String)


class Categories(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    icon = Column(String)
    slug = Column(String, index=True, unique=True)
    stories = relationship("Stories", back_populates="category")


class Stories(Base):
    __tablename__ = "stories"
    id = Column(Integer, primary_key=True)
    slug = Column(String, index=True, unique=True)
    title = Column(String)
    subtitle = Column(String)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"))
    thumbnail = Column(String)
    videoUrl = Column(String)
    pdfUrl = Column(String)
    pdfpagecount = Column(Integer)
    moral = Column(Text)
    duration = Column(String)
    popularity = Column(Integer)
    isComingSoon = Column(Boolean)
    createdAt = Column(String)
    category = relationship("Categories", back_populates="stories")
