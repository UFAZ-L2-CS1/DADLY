"""
SQLAlchemy database models for DADLY
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
import sqlalchemy as sa
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    dietary_type = Column(
        String(20), default="none"
    )  # none, vegetarian, vegan, gluten_free, keto
    allergies = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    interactions = relationship("UserRecipeInteraction", back_populates="user")
    pantry_items = relationship("PantryItem", back_populates="user")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    prep_time = Column(Integer, nullable=False)  # minutes
    cook_time = Column(Integer, nullable=False)  # minutes
    difficulty = Column(String(10), nullable=False)  # easy, medium, hard
    image_url = Column(String(500))
    instructions = Column(Text, nullable=False)
    ingredients = Column(Text, nullable=False)  # JSON string of ingredients list
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    interactions = relationship("UserRecipeInteraction", back_populates="recipe")


class UserRecipeInteraction(Base):
    __tablename__ = "user_recipe_interactions"
    __table_args__ = (
        # Prevent duplicate likes: a user can only like a recipe once
        # This is enforced at the database level to prevent race conditions
        sa.UniqueConstraint('user_id', 'recipe_id', name='uq_user_recipe'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    liked = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="interactions")
    recipe = relationship("Recipe", back_populates="interactions")


class PantryItem(Base):
    __tablename__ = "pantry_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ingredient_name = Column(String(100), nullable=False)
    quantity = Column(String(50))  # "2 cups", "500g", etc.
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="pantry_items")