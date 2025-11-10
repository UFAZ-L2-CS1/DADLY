"""
Pantry and ingredient management endpoints for DADLY
Handles user's pantry items and ingredient tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from app.db.database import db_dependency
from app.models.models import User, PantryItem
from app.api.auth import get_current_user
from app.schemas.schemas import AddIngredientRequest, BulkAddRequest, PantryItemResponse
from app.config.config import get_logger

router = APIRouter()
logger = get_logger(__name__)


def normalize_ingredient_name(name: str) -> str:
    """
    Normalize ingredient name to lowercase and strip whitespace.
    Ensures consistent storage and comparison.
    """
    return name.strip().lower()


@router.get("/", response_model=list[PantryItemResponse], tags=["Pantry"])
async def get_pantry_ingredients(
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Get all ingredients in user's pantry
    
    Returns list of pantry items ordered by most recently added.
    """
    try:
        # Get all pantry items for user
        pantry_items = db.query(PantryItem).filter(
            PantryItem.user_id == current_user.id
        ).order_by(PantryItem.added_at.desc()).all()
        
        return pantry_items
        
    except Exception as e:
        logger.error(f"Error getting pantry for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/", tags=["Pantry"])
async def add_pantry_ingredient(
    request: AddIngredientRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Add single ingredient to user's pantry
    
    Rejects if ingredient already exists (case-insensitive).
    Stores ingredient name in lowercase for consistency.
    """
    try:
        # Normalize ingredient name to lowercase
        # (Validation already done by Pydantic schema)
        ingredient_lower = normalize_ingredient_name(request.ingredient_name)
        
        # Check if ingredient already exists (case-insensitive)
        # Use func.lower() to handle any legacy mixed-case data
        existing = db.query(PantryItem).filter(
            PantryItem.user_id == current_user.id,
            func.lower(PantryItem.ingredient_name) == ingredient_lower
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"Ingredient '{ingredient_lower}' already exists in pantry"
            )
        
        # Add new ingredient
        new_item = PantryItem(
            user_id=current_user.id,
            ingredient_name=ingredient_lower,
            quantity=request.quantity
        )
        db.add(new_item)
        
        try:
            db.commit()
            db.refresh(new_item)
        except IntegrityError:
            # Race condition: another request added this between our check and commit
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Ingredient '{ingredient_lower}' already exists in pantry"
            )
        
        logger.info(f"User {current_user.id} added ingredient: {ingredient_lower}")
        
        return {
            "message": "Ingredient added successfully",
            "ingredient": {
                "id": new_item.id,
                "ingredient_name": new_item.ingredient_name,
                "quantity": new_item.quantity,
                "added_at": new_item.added_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding ingredient for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/bulk", tags=["Pantry"])
async def add_multiple_ingredients(
    request: BulkAddRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Add multiple ingredients to pantry at once
    
    Automatically deduplicates the input list (keeps first occurrence).
    Skips ingredients that already exist in user's pantry.
    Returns summary of added and skipped items.
    """
    try:
        if not request.ingredients:
            raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")
        
        # Get existing pantry items (normalize to lowercase for comparison)
        existing_items = db.query(func.lower(PantryItem.ingredient_name)).filter(
            PantryItem.user_id == current_user.id
        ).all()
        existing_set = {item[0] for item in existing_items}
        
        # Deduplicate input list (case-insensitive, keep first)
        # Validation already done by Pydantic schema for each AddIngredientRequest
        seen = set()
        unique_ingredients = []
        
        for item in request.ingredients:
            ingredient_lower = normalize_ingredient_name(item.ingredient_name)
            
            if ingredient_lower not in seen:
                seen.add(ingredient_lower)
                unique_ingredients.append((ingredient_lower, item.quantity))
        
        # Add ingredients (skip existing check, rely on unique constraint)
        # This prevents race conditions by letting database enforce uniqueness
        added = []
        skipped = []
        
        for ingredient_name, quantity in unique_ingredients:
            # Skip if we already know it exists from our pre-check
            if ingredient_name in existing_set:
                skipped.append(ingredient_name)
                continue
            
            new_item = PantryItem(
                user_id=current_user.id,
                ingredient_name=ingredient_name,
                quantity=quantity
            )
            db.add(new_item)
        
        # Commit all at once - if any constraint violation, handle it
        try:
            db.commit()
            # If successful, all items were added
            added = [name for name, _ in unique_ingredients if name not in existing_set]
        except IntegrityError:
            # Some items conflicted - need to check which ones succeeded
            db.rollback()
            # Re-add one by one to identify conflicts
            for ingredient_name, quantity in unique_ingredients:
                if ingredient_name in existing_set:
                    skipped.append(ingredient_name)
                    continue
                try:
                    new_item = PantryItem(
                        user_id=current_user.id,
                        ingredient_name=ingredient_name,
                        quantity=quantity
                    )
                    db.add(new_item)
                    db.commit()
                    added.append(ingredient_name)
                except IntegrityError:
                    db.rollback()
                    skipped.append(ingredient_name)
        
        logger.info(f"User {current_user.id} bulk added {len(added)} ingredients, skipped {len(skipped)}")
        
        return {
            "message": "Bulk add completed",
            "added": added,
            "skipped": skipped,
            "added_count": len(added),
            "skipped_count": len(skipped)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error bulk adding ingredients for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{ingredient_id}", tags=["Pantry"])
async def remove_pantry_ingredient(
    ingredient_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Remove single ingredient from pantry
    
    Only allows deleting ingredients that belong to the current user.
    """
    try:
        # Find ingredient and verify ownership
        ingredient = db.query(PantryItem).filter(
            PantryItem.id == ingredient_id,
            PantryItem.user_id == current_user.id
        ).first()
        
        if not ingredient:
            raise HTTPException(
                status_code=404, 
                detail="Ingredient not found or does not belong to you"
            )
        
        ingredient_name = ingredient.ingredient_name
        db.delete(ingredient)
        db.commit()
        
        logger.info(f"User {current_user.id} deleted ingredient: {ingredient_name}")
        
        return {
            "message": "Ingredient removed successfully",
            "ingredient_name": ingredient_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting ingredient {ingredient_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/", tags=["Pantry"])
async def clear_pantry(
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Clear all ingredients from pantry
    
    Deletes all pantry items for the current user.
    """
    try:
        # Delete all user's pantry items
        deleted_count = db.query(PantryItem).filter(
            PantryItem.user_id == current_user.id
        ).delete(synchronize_session=False)
        
        db.commit()
        
        logger.info(f"User {current_user.id} cleared pantry ({deleted_count} items)")
        
        return {
            "message": "Pantry cleared successfully",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error clearing pantry for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")    