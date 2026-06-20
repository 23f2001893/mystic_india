from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    dbId: int
    name: str
    description: str | None = None
    icon: str | None = None
    slug: str
    color: str | None = None
    gradient: str | None = None
    storyCount: int = 0


class CategoryCreate(BaseModel):
    slug: str
    name: str
    description: str | None = None
    icon: str | None = None


class CategoryUpdate(BaseModel):
    slug: str | None = None
    name: str | None = None
    description: str | None = None
    icon: str | None = None


class StoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    subtitle: str | None = None
    description: str | None = None
    category: str | None = None
    category_id: int | None = None
    thumbnail: str | None = None
    videoUrl: str | None = None
    pdfUrl: str | None = None
    moral: str | None = None
    duration: str | None = None
    popularity: int | None = 0
    isComingSoon: bool | None = False
    createdAt: str | None = None


class StoryCreate(BaseModel):
    slug: str
    title: str
    subtitle: str | None = None
    description: str | None = None
    category: str
    thumbnail: str | None = None
    videoUrl: str | None = None
    pdfUrl: str | None = None
    moral: str | None = None
    duration: str | None = None
    popularity: int | None = 0
    isComingSoon: bool | None = False
    createdAt: str | None = None


class StoryUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    category: str | None = None
    thumbnail: str | None = None
    videoUrl: str | None = None
    pdfUrl: str | None = None
    moral: str | None = None
    duration: str | None = None
    popularity: int | None = None
    isComingSoon: bool | None = None
    createdAt: str | None = None


class UserCreate(BaseModel):
    username: str
    mobile_no: str | None = None
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    mobile_no: str | None = None
    role: str


class AuthOut(BaseModel):
    token: str
    user: UserOut
