"""
Simple database models for DADLY MVP
Designed for 1-month university project timeline
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator


class DietaryType(str, Enum):
    """Dietary restriction types"""

    NONE = "none"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    KETO = "keto"


class DifficultyLevel(str, Enum):
    """Recipe difficulty levels"""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    dietary_type: DietaryType = DietaryType.NONE
    allergies: Optional[str] = None


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @staticmethod
    def password_strength(v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenWithRefresh(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Recipe Models
class RecipeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    prep_time: int  # minutes
    cook_time: int  # minutes
    difficulty: DifficultyLevel
    image_url: Optional[str] = None
    instructions: str
    ingredients: List[str]
    like_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# User-Recipe Interactions
class UserRecipeInteraction(BaseModel):
    user_id: int
    recipe_id: int
    liked: bool
    created_at: datetime


# Pantry Management
class PantryItemResponse(BaseModel):
    """Response model for pantry items"""
    id: int
    ingredient_name: str
    quantity: Optional[str] = None
    added_at: datetime

    class Config:
        from_attributes = True


class AddIngredientRequest(BaseModel):
    """Request model for adding a single ingredient"""
    ingredient_name: str
    quantity: Optional[str] = None


class BulkAddRequest(BaseModel):
    """Request model for bulk adding ingredients"""
    ingredients: List[AddIngredientRequest]





# API Response Models (COMMENTED OUT FOR MVP - UNCOMMENT LATER IF NEEDED)
# class RecipeMatch(BaseModel):
#     """Recipe with match percentage based on available ingredients"""
#
#     recipe: RecipeResponse
#     match_percentage: float
#     missing_ingredients: List[str]


# class SwipeResponse(BaseModel):
#     """Response after swiping on a recipe"""
#
#     recipe_id: int
#     liked: bool
#     next_recipe: Optional[RecipeResponse] = None
