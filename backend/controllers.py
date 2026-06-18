import base64
import hashlib
import hmac
import json
import os
import secrets
import time

from fastapi import Depends, Header, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session as DbSession, joinedload

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


SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-for-production")
TOKEN_TTL_SECONDS = 60 * 60 * 24


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


def serialize_category(category: Categories) -> CategoryOut:
    meta = CATEGORY_META.get(category.slug, {})
    return CategoryOut(
        id=category.slug,
        dbId=category.id,
        slug=category.slug,
        name=category.name,
        description=category.description,
        icon=category.icon,
        color=meta.get("color"),
        gradient=meta.get("gradient"),
        storyCount=len(category.stories or []),
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
    payload = {
        "sub": user.id,
        "role": user.role,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    payload_json = json.dumps(payload, separators=(",", ":")).encode()
    payload_part = base64.urlsafe_b64encode(payload_json).decode().rstrip("=")
    signature = hmac.new(SECRET_KEY.encode(), payload_part.encode(), hashlib.sha256).digest()
    signature_part = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{payload_part}.{signature_part}"


def decode_token(token: str) -> dict:
    try:
        payload_part, signature_part = token.split(".", 1)
        expected_signature = hmac.new(SECRET_KEY.encode(), payload_part.encode(), hashlib.sha256).digest()
        expected_signature_part = base64.urlsafe_b64encode(expected_signature).decode().rstrip("=")

        if not hmac.compare_digest(signature_part, expected_signature_part):
            raise ValueError

        padded_payload = payload_part + "=" * (-len(payload_part) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded_payload))
    except (ValueError, json.JSONDecodeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if payload.get("exp", 0) < time.time():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

    return payload


def get_current_user(
    authorization: str | None = Header(default=None),
    db: DbSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    payload = decode_token(authorization.removeprefix("Bearer ").strip())
    user = db.query(User).filter(User.id == payload.get("sub")).first()
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

    if category_slug:
        story.category_id = get_category_by_slug(db, category_slug).id

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
    categories = (
        db.query(Categories)
        .options(joinedload(Categories.stories))
        .order_by(Categories.id)
        .all()
    )
    return [serialize_category(category) for category in categories]


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
    existing_story = db.query(Stories).filter(Stories.slug == payload.slug).first()
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

    if payload.slug and payload.slug != story.slug:
        existing_story = db.query(Stories).filter(Stories.slug == payload.slug).first()
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
    story = (
        db.query(Stories)
        .options(joinedload(Stories.category))
        .filter(Stories.slug == slug)
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
