"""
Pantry and ingredient management endpoints for DADLY
Handles user's pantry items and ingredient tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated 

from app.db.database import db_dependency
from app.models.models import User, PantryItem
from app.api.auth import get_current_user
from app.schemas.schemas import AddIngredientRequest, BulkAddRequest, PantryItemResponse
from app.config.config import get_logger

router = APIRouter()
logger = get_logger(__name__)



@router.get("/", tags=["Pantry"])
async def get_pantry_ingredients(
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Get all ingredients in user's pantry
    
    Returns list of pantry items. Automatically cleans up any duplicate entries,
    keeping only the most recent one for each ingredient.
    """
    try:
        # Get all pantry items for user
        pantry_items = db.query(PantryItem).filter(
            PantryItem.user_id == current_user.id
        ).order_by(PantryItem.added_at.desc()).all()
        
        # Detect and clean duplicates (case-insensitive)
        seen_ingredients = set()
        duplicates_to_delete = []
        clean_items = []
        
        for item in pantry_items:
            ingredient_lower = item.ingredient_name.lower()
            if ingredient_lower in seen_ingredients:
                # Duplicate found - mark for deletion
                duplicates_to_delete.append(item.id)
            else:
                seen_ingredients.add(ingredient_lower)
                clean_items.append(item)
        
        # Delete duplicates from database
        if duplicates_to_delete:
            db.query(PantryItem).filter(PantryItem.id.in_(duplicates_to_delete)).delete(synchronize_session=False)
            db.commit()
            logger.info(f"Cleaned {len(duplicates_to_delete)} duplicate pantry items for user {current_user.id}")
        
        # Return clean list
        result = [
            {
                "id": item.id,
                "ingredient_name": item.ingredient_name,
                "quantity": item.quantity,
                "added_at": item.added_at.isoformat()
            }
            for item in clean_items
        ]
        
        return result
        
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
        ingredient_lower = request.ingredient_name.strip().lower()
        
        if not ingredient_lower:
            raise HTTPException(status_code=400, detail="Ingredient name cannot be empty")
        
        # Check if ingredient already exists (case-insensitive)
        existing = db.query(PantryItem).filter(
            PantryItem.user_id == current_user.id,
            PantryItem.ingredient_name == ingredient_lower
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
        db.commit()
        db.refresh(new_item)
        
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
        
        # Get existing pantry items
        existing_items = db.query(PantryItem.ingredient_name).filter(
            PantryItem.user_id == current_user.id
        ).all()
        existing_set = {item[0].lower() for item in existing_items}
        
        # Deduplicate input list (case-insensitive, keep first)
        seen = set()
        unique_ingredients = []
        for item in request.ingredients:
            ingredient_lower = item.ingredient_name.strip().lower()
            if ingredient_lower and ingredient_lower not in seen:
                seen.add(ingredient_lower)
                unique_ingredients.append((ingredient_lower, item.quantity))
        
        # Filter out already existing ingredients
        added = []
        skipped = []
        
        for ingredient_name, quantity in unique_ingredients:
            if ingredient_name in existing_set:
                skipped.append(ingredient_name)
            else:
                new_item = PantryItem(
                    user_id=current_user.id,
                    ingredient_name=ingredient_name,
                    quantity=quantity
                )
                db.add(new_item)
                added.append(ingredient_name)
        
        db.commit()
        
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