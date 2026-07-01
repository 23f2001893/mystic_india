import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import Depends, Header, HTTPException, Query, status, UploadFile, File
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session as DbSession, joinedload
from s3_utils import upload_file_to_s3, convert_pdf_to_images_and_upload

from app import app
from database import get_db
from models import Categories, Stories, User
from schemas import (
    AuthOut,
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    StoryCreate,
    StoryOut,
    StoryUpdate,
    UserCreate,
    UserLogin,
    UserOut,
)


SECRET_KEY = os.getenv("SECRET_KEY")
TOKEN_TTL_SECONDS = 60*60

JWT_ALGORITHM = "HS256"


CATEGORY_META = {
    "cosmic-myths": {"color": "cosmic", "gradient": "from-blue-600 to-indigo-500"},
    "legends-gods": {"color": "legends", "gradient": "from-yellow-600 to-orange-500"},
    "heroic-journeys": {"color": "heroic", "gradient": "from-red-600 to-rose-500"},
    "wisdom-sages": {"color": "wisdom", "gradient": "from-emerald-600 to-green-500"},
    "divine-love": {"color": "love", "gradient": "from-pink-600 to-purple-500"},
    "animals-symbolism": {"color": "animals", "gradient": "from-amber-600 to-yellow-500"},
    "power-responsibility": {"color": "power", "gradient": "from-violet-600 to-fuchsia-500"},
    "hidden-gems": {"color": "gems", "gradient": "from-cyan-600 to-blue-500"},
    "modern-lessons": {"color": "modern", "gradient": "from-teal-600 to-cyan-500"},
    "festivals": {"color": "festivals", "gradient": "from-fuchsia-600 to-pink-500"},
}


def serialize_category(
    category: Categories,
    story_count: int | None = None,
    published_story_count: int | None = None,
    coming_soon_story_count: int | None = None,
) -> CategoryOut:
    meta = CATEGORY_META.get(category.slug, {})
    stories = category.stories or []
    resolved_story_count = story_count if story_count is not None else len(stories)
    resolved_published_count = (
        published_story_count
        if published_story_count is not None
        else len([story for story in stories if not story.isComingSoon])
    )
    resolved_coming_soon_count = (
        coming_soon_story_count
        if coming_soon_story_count is not None
        else len([story for story in stories if story.isComingSoon])
    )

    return CategoryOut(
        id=category.slug,
        dbId=category.id,
        slug=category.slug,
        name=category.name,
        description=category.description,
        icon=category.icon,
        color=meta.get("color"),
        gradient=meta.get("gradient"),
        storyCount=resolved_story_count,
        publishedStoryCount=resolved_published_count,
        comingSoonStoryCount=resolved_coming_soon_count,
    )


def serialize_story(story: Stories) -> StoryOut:
    return StoryOut(
        id=story.id,
        slug=story.slug,
        title=story.title,
        subtitle=story.subtitle,
        description=story.description,
        category=story.category.slug if story.category else None,
        category_id=story.category_id,
        thumbnail=story.thumbnail,
        videoUrl=story.videoUrl,
        pdfUrl=story.pdfUrl,
        pdfpagecount=story.pdfpagecount,
        moral=story.moral,
        duration=story.duration,
        popularity=story.popularity,
        isComingSoon=story.isComingSoon,
        createdAt=story.createdAt,
    )


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt, saved_digest = password_hash.split("$", 1)
    except ValueError:
        return False

    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return hmac.compare_digest(saved_digest, digest.hex())


def create_token(user: User) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=TOKEN_TTL_SECONDS)
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": expires_at,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(
    authorization: str | None = Header(default=None),
    db: DbSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    payload = decode_token(authorization.removeprefix("Bearer ").strip())
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def get_category_by_slug(db: DbSession, slug: str) -> Categories:
    category = db.query(Categories).filter(Categories.slug == slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


def apply_story_payload(story: Stories, payload: StoryCreate | StoryUpdate, db: DbSession) -> Stories:
    data = payload.model_dump(exclude_unset=True)
    category_slug = data.pop("category", None)
    if "slug" in data and data["slug"] is not None:
        data["slug"] = data["slug"].strip()

    if category_slug:
        story.category_id = get_category_by_slug(db, category_slug.strip()).id

    for field, value in data.items():
        setattr(story, field, value)

    return story


def apply_category_payload(category: Categories, payload: CategoryCreate | CategoryUpdate) -> Categories:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(category, field, value)
    return category


@app.get("/")
def home():
    return {"message": "Mystic India API is running"}


@app.post("/api/auth/register", response_model=AuthOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: DbSession = Depends(get_db)):
    username = payload.username.strip()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already exists")

    role = "admin" if db.query(User).count() == 0 else "user"
    user = User(
        username=username,
        mobile_no=payload.mobile_no,
        password_hash=hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthOut(token=create_token(user), user=user)
@app.post("/api/admin/upload", status_code=status.HTTP_201_CREATED)
def upload_file(
    file: UploadFile = File(...),
    file_type: str = "misc",
    _: User = Depends(require_admin),
):
    if file_type == "pdf":
        try:
            base_url, page_count = convert_pdf_to_images_and_upload(file)
        except ValueError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        except (BotoCoreError, ClientError) as exc:
            raise HTTPException(status_code=502, detail=f"S3 upload failed: {exc}") from exc
        return {"url": base_url, "fileType": "pdf", "pageCount": page_count}

    allowed_folders = {
        "thumbnail": "thumbnails",
        "video": "videos",
    }
    folder_name = allowed_folders.get(file_type)
    if not folder_name:
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        file_url = upload_file_to_s3(file, folder_name)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=502, detail=f"S3 upload failed: {exc}") from exc

    return {"url": file_url, "fileType": file_type}


@app.post("/api/auth/login", response_model=AuthOut)
def login_user(payload: UserLogin, db: DbSession = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username.strip()).first()
    if not user or not verify_password(payload.password, user.password_hash or ""):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return AuthOut(token=create_token(user), user=user)


@app.get("/api/auth/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user


@app.get("/api/categories", response_model=list[CategoryOut])
def get_categories(db: DbSession = Depends(get_db)):
    published_condition = or_(Stories.isComingSoon.is_(False), Stories.isComingSoon.is_(None))
    category_rows = (
        db.query(Categories)
        .outerjoin(Stories, Stories.category_id == Categories.id)
        .add_columns(
            func.count(Stories.id).label("story_count"),
            func.sum(case((published_condition, 1), else_=0)).label("published_story_count"),
            func.sum(case((Stories.isComingSoon.is_(True), 1), else_=0)).label("coming_soon_story_count"),
        )
        .group_by(Categories.id)
        .order_by(
            func.sum(case((published_condition, 1), else_=0)).desc(),
            Categories.id,
        )
        .all()
    )

    return [
        serialize_category(
            category,
            story_count=story_count or 0,
            published_story_count=published_story_count or 0,
            coming_soon_story_count=coming_soon_story_count or 0,
        )
        for category, story_count, published_story_count, coming_soon_story_count in category_rows
    ]

@app.post("/api/admin/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: DbSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    existing_category = db.query(Categories).filter(Categories.slug == payload.slug).first()
    if existing_category:
        raise HTTPException(status_code=409, detail="Category slug already exists")

    category = apply_category_payload(Categories(), payload)
    db.add(category)
    db.commit()
    db.refresh(category)
    return serialize_category(category)


@app.put("/api/admin/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: DbSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    category = (
        db.query(Categories)
        .options(joinedload(Categories.stories))
        .filter(Categories.id == category_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if payload.slug and payload.slug != category.slug:
        existing_category = db.query(Categories).filter(Categories.slug == payload.slug).first()
        if existing_category:
            raise HTTPException(status_code=409, detail="Category slug already exists")

    category = apply_category_payload(category, payload)
    db.commit()
    db.refresh(category)
    return serialize_category(category)


@app.delete("/api/admin/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: DbSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    category = (
        db.query(Categories)
        .options(joinedload(Categories.stories))
        .filter(Categories.id == category_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.stories:
        raise HTTPException(status_code=409, detail="Move or delete stories before deleting this category")

    db.delete(category)
    db.commit()
    return None


@app.get("/api/stories", response_model=list[StoryOut])
def get_stories(
    category: str | None = None,
    sort: str = Query("popular", pattern="^(popular|newest|az)$"),
    db: DbSession = Depends(get_db),
):
    query = db.query(Stories).options(joinedload(Stories.category))

    if category and category != "all":
        query = query.join(Stories.category).filter(Categories.slug == category)

    if sort == "popular":
        query = query.order_by(Stories.popularity.desc().nullslast())
    elif sort == "newest":
        query = query.order_by(Stories.createdAt.desc())
    else:
        query = query.order_by(Stories.title.asc())

    return [serialize_story(story) for story in query.all()]


@app.post("/api/admin/stories", response_model=StoryOut, status_code=status.HTTP_201_CREATED)
def create_story(
    payload: StoryCreate,
    db: DbSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    clean_slug = payload.slug.strip()
    existing_story = db.query(Stories).filter(func.trim(Stories.slug) == clean_slug).first()
    if existing_story:
        raise HTTPException(status_code=409, detail="Story slug already exists")

    story = apply_story_payload(Stories(), payload, db)
    db.add(story)
    db.commit()
    db.refresh(story)
    return serialize_story(story)


@app.put("/api/admin/stories/{story_id}", response_model=StoryOut)
def update_story(
    story_id: int,
    payload: StoryUpdate,
    db: DbSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    story = db.query(Stories).options(joinedload(Stories.category)).filter(Stories.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    if payload.slug and payload.slug.strip() != (story.slug or "").strip():
        clean_slug = payload.slug.strip()
        existing_story = db.query(Stories).filter(func.trim(Stories.slug) == clean_slug).first()
        if existing_story:
            raise HTTPException(status_code=409, detail="Story slug already exists")

    story = apply_story_payload(story, payload, db)
    db.commit()
    db.refresh(story)
    return serialize_story(story)


@app.delete("/api/admin/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(
    story_id: int,
    db: DbSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    story = db.query(Stories).filter(Stories.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    db.delete(story)
    db.commit()
    return None


@app.get("/api/stories/featured", response_model=list[StoryOut])
def get_featured_stories(
    limit: int = Query(3, ge=1, le=20),
    db: DbSession = Depends(get_db),
):
    stories = (
        db.query(Stories)
        .options(joinedload(Stories.category))
        .order_by(Stories.popularity.desc().nullslast())
        .limit(limit)
        .all()
    )
    return [serialize_story(story) for story in stories]


@app.get("/api/stories/{slug}", response_model=StoryOut)
def get_story_by_slug(slug: str, db: DbSession = Depends(get_db)):
    clean_slug = slug.strip()
    story = (
        db.query(Stories)
        .options(joinedload(Stories.category))
        .filter(func.trim(Stories.slug) == clean_slug)
        .first()
    )
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return serialize_story(story)


@app.get("/api/stories/{story_id}/related", response_model=list[StoryOut])
def get_related_stories(
    story_id: int,
    limit: int = Query(3, ge=1, le=12),
    db: DbSession = Depends(get_db),
):
    story = db.query(Stories).filter(Stories.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    related = (
        db.query(Stories)
        .options(joinedload(Stories.category))
        .filter(Stories.id != story_id)
        .filter(Stories.category_id == story.category_id)
        .order_by(Stories.popularity.desc().nullslast())
        .limit(limit)
        .all()
    )

    if len(related) < limit:
        extra = (
            db.query(Stories)
            .options(joinedload(Stories.category))
            .filter(Stories.id != story_id)
            .filter(Stories.category_id != story.category_id)
            .order_by(Stories.popularity.desc().nullslast())
            .limit(limit - len(related))
            .all()
        )
        related.extend(extra)

    return [serialize_story(item) for item in related]


@app.get("/api/search/stories", response_model=list[StoryOut])
def search_stories(
    q: str = Query(..., min_length=2),
    db: DbSession = Depends(get_db),
):
    search = f"%{q}%"
    stories = (
        db.query(Stories)
        .options(joinedload(Stories.category))
        .outerjoin(Stories.category)
        .filter(
            or_(
                Stories.title.ilike(search),
                Stories.description.ilike(search),
                Categories.slug.ilike(search),
                Categories.name.ilike(search),
            )
        )
        .order_by(Stories.popularity.desc().nullslast())
        .limit(20)
        .all()
    )
    return [serialize_story(story) for story in stories]


@app.get("/stories", response_model=list[StoryOut])
def legacy_stories(db: DbSession = Depends(get_db)):
    return get_stories(db=db)
