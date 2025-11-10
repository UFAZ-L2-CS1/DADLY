"""
User profile management endpoints for DADLY
Handles user profile operations and preferences
"""

from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
import bcrypt

from app.db.database import db_dependency
from app.models.models import User, Recipe, UserRecipeInteraction, PantryItem
from app.api.auth import get_current_user, token_blacklist, oauth2_scheme
from app.schemas.schemas import (
    UserResponse,
    UserUpdateRequest,
    UserDeleteRequest,
    UserStatsResponse
)
from app.config.config import get_logger
from sqlalchemy import update, func

router = APIRouter()
logger = get_logger(__name__)


@router.put("/profile", response_model=UserResponse, tags=["Users"])
async def update_user_profile(
    request: UserUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Update user profile information (partial update)
    
    Only updates fields that are provided in the request.
    - **name**: Update display name
    - **dietary_type**: Update dietary preferences (none, vegetarian, vegan, gluten_free, keto)
    - **allergies**: Update allergy information
    
    Note: Email and password cannot be changed via this endpoint.
    """
    try:
        # Track if any updates were made
        updated = False
        
        # Update only provided fields
        if request.name is not None:
            current_user.name = request.name.strip()
            updated = True
        
        if request.dietary_type is not None:
            current_user.dietary_type = request.dietary_type.value
            updated = True
        
        if request.allergies is not None:
            current_user.allergies = request.allergies
            updated = True
        
        if not updated:
            # No fields provided to update
            raise HTTPException(
                status_code=400,
                detail="No fields provided to update"
            )
        
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"User {current_user.id} updated profile")
        return current_user
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Error updating profile for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/profile", tags=["Users"])
async def delete_user_account(
    request: UserDeleteRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    token: Annotated[str, Depends(oauth2_scheme)],
    db: db_dependency
):
    """
    Delete user account and all associated data
    
    Requires password confirmation for security.
    
    Deletes:
    - User account
    - All pantry items
    - All recipe interactions
    - Decrements like counts on liked recipes
    
    The current JWT token will be blacklisted.
    """
    try:
        # Verify password
        if not bcrypt.checkpw(request.password.encode('utf-8'), current_user.hashed_password.encode('utf-8')):
            raise HTTPException(
                status_code=401,
                detail="Incorrect password"
            )
        
        user_id = current_user.id
        
        # Get all liked recipes to decrement their like_count
        liked_interactions = db.query(UserRecipeInteraction).filter(
            UserRecipeInteraction.user_id == user_id,
            UserRecipeInteraction.liked.is_(True)
        ).all()
        
        liked_recipe_ids = [interaction.recipe_id for interaction in liked_interactions]
        
        # Decrement like_count for all liked recipes (atomic)
        if liked_recipe_ids:
            db.execute(
                update(Recipe)
                .where(Recipe.id.in_(liked_recipe_ids))
                .values(like_count=func.greatest(0, Recipe.like_count - 1))
            )
                
        # Delete user interactions (no cascade configured, so explicit deletion required)
        db.query(UserRecipeInteraction).filter(
            UserRecipeInteraction.user_id == user_id
        ).delete(synchronize_session=False)
        
        # Delete pantry items
        db.query(PantryItem).filter(
            PantryItem.user_id == user_id
        ).delete(synchronize_session=False)
        
        # Delete user
        db.delete(current_user)
        
        db.commit()
        
        # Blacklist current token (after successful commit)
        token_blacklist.add(token)
        
        logger.info(f"User {user_id} account deleted (liked: {len(liked_recipe_ids)} recipes)")
        
        return {
            "message": "Account deleted successfully",
            "recipes_unliked": len(liked_recipe_ids)
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Error deleting account for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/stats", response_model=UserStatsResponse, tags=["Users"])
async def get_user_stats(
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Get user statistics
    
    Returns:
    - Total recipes liked
    - Total pantry items
    - Account creation date
    - Days since account creation
    """
    try:
        # Count liked recipes
        total_liked = db.query(UserRecipeInteraction).filter(
            UserRecipeInteraction.user_id == current_user.id,
            UserRecipeInteraction.liked.is_(True)
        ).count()
        
        # Count pantry items
        total_pantry = db.query(PantryItem).filter(
            PantryItem.user_id == current_user.id
        ).count()
        
        # Calculate days active
        now = datetime.now(timezone.utc)
        # Handle both timezone-aware and naive datetimes
        created_at = current_user.created_at
        if created_at.tzinfo is None:
            # Assume UTC if naive
            created_at = created_at.replace(tzinfo=timezone.utc)
        days_active = max(0, (now - created_at).days)
        
        return UserStatsResponse(
            total_recipes_liked=total_liked,
            total_pantry_items=total_pantry,
            account_created_at=created_at,
            days_active=days_active
        )
        
    except Exception as e:
        logger.error(f"Error getting stats for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
