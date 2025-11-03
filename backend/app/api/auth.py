from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, status
import bcrypt
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt

from app.schemas.schemas import UserCreate, UserResponse, Token, TokenWithRefresh, RefreshTokenRequest
from app.db.database import db_dependency
from app.models.models import User
from app.config.config import get_logger, Config

logger = get_logger(__name__)

router = APIRouter()

# JWT Configuration from Config class
SECRET_KEY = Config.SECRET_KEY
ALGORITHM = Config.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = Config.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = Config.REFRESH_TOKEN_EXPIRE_DAYS

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

token_blacklist = set()


@router.post("/register", response_model=UserResponse, tags=["Authentication"])
async def register_user(db: db_dependency, user: UserCreate):
    """
    Register a new user with email and password

    - **email**: Valid email address
    - **name**: User's display name
    - **password**: Minimum 8 characters
    - **dietary_type**: Optional dietary preference
    - **allergies**: Optional allergy information
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # Create new user with hashed password
    create_user_model = User(
        email=user.email,
        name=user.name,
        hashed_password=bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        dietary_type=user.dietary_type,
        allergies=user.allergies
    )
    
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    
    logger.info(f"New user registered: {user.email}")
    return create_user_model


@router.post("/token", response_model=TokenWithRefresh, tags=["Authentication"])
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    """
    Login with email and password to get access token and refresh token
    
    - **username**: User's email address (OAuth2 uses 'username' field)
    - **password**: User's password
    
    Returns JWT access token and refresh token for authenticated requests
    """

    user = authenticate_user(form_data.username, form_data.password, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token = create_access_token(user.email, user.id, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token = create_refresh_token(user.email, user.id, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    
    logger.info(f"User logged in: {user.email}")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def authenticate_user(email: str, password: str, db: db_dependency):
    """Authenticate user by email and password"""
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return False
    if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        return False
    return user


def create_access_token(email: str, user_id: int, expires_delta: timedelta):
    """Create JWT access token"""
    encode = {"sub": email, "id": user_id, "type": "access"}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(email: str, user_id: int, expires_delta: timedelta):
    """Create JWT refresh token"""
    encode = {"sub": email, "id": user_id, "type": "refresh"}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: db_dependency):
    """Get current user from access token"""
    # Check if token is blacklisted
    if token in token_blacklist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked."
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        token_type: str = payload.get("type")
        
        # Ensure it's an access token
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type."
            )
        
        if email is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Could not validate credentials.")
        user = db.query(User).filter(User.email == email, User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="User not found.")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Could not validate user.")

@router.get("/me", response_model=UserResponse, tags=["Authentication"])
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Get current authenticated user's information
    
    Requires valid JWT token in Authorization header:
    Authorization: Bearer <token>
    """
    return current_user


@router.post("/refresh", response_model=Token, tags=["Authentication"])
async def refresh_access_token(request: RefreshTokenRequest, db: db_dependency):
    """
    Get a new access token using refresh token
    
    - **refresh_token**: Valid refresh token from login (sent in request body)
    
    Returns new access token
    """
    refresh_token = request.refresh_token
    
    # Check if token is blacklisted
    if refresh_token in token_blacklist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked."
        )
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        token_type: str = payload.get("type")
        
        # Ensure it's a refresh token
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type. Refresh token required."
            )
        
        if email is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials."
            )
        
        # Verify user still exists
        user = db.query(User).filter(User.email == email, User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found."
            )
        
        # Create new access token
        new_access_token = create_access_token(
            user.email, 
            user.id, 
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        logger.info(f"Access token refreshed for user: {user.email}")
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token."
        )


@router.post("/logout", tags=["Authentication"])
async def logout(current_user: Annotated[User, Depends(get_current_user)],
                token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Logout user and invalidate current token
    
    Requires valid JWT token in Authorization header.
    The token will be blacklisted and cannot be used again.
    """
    # Add token to blacklist
    token_blacklist.add(token)
    
    logger.info(f"User logged out: {current_user.email}")
    return {"message": "Successfully logged out"}   