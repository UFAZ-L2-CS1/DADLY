"""
Recipe management and discovery endpoints for DADLY
Handles recipe operations, swiping, and recommendations
"""

import json
from typing import Optional, Annotated
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy import func, or_, update

from app.schemas.schemas import RecipeResponse
from app.db.database import db_dependency
from app.models.models import Recipe, User, UserRecipeInteraction, PantryItem
from app.config.config import get_logger
from app.api.auth import get_current_user

router = APIRouter()
logger = get_logger(__name__)


# Helper function to create minimal recipe response
def create_minimal_recipe_response(recipe: Recipe) -> dict:
    """Create minimal recipe data for feed"""
    return {
        "id": recipe.id,
        "name": recipe.name,
        "image_url": recipe.image_url,
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "difficulty": recipe.difficulty,
        "like_count": recipe.like_count,
    }


@router.get("/feed", tags=["Recipes"])
async def get_recipe_feed(
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency,
    limit: int = Query(20, ge=1, le=50),
    exclude: Optional[str] = Query(None, description="Comma-separated recipe IDs to exclude (session-based)")
):
    """
    Get recipe feed for swiping interface
    
    Returns recipes filtered by:
    - User's dietary preferences
    - Excludes already liked recipes (permanent)
    - Excludes session-excluded recipes (temporary)
    - Prioritizes recipes matching user's pantry items if available
    
    Returns minimal recipe data for performance.
    Use GET /recipes/{id} for full details.
    """
    try:
        # Get liked recipe IDs (permanent exclusion)
        liked_recipe_ids = db.query(UserRecipeInteraction.recipe_id).filter(
            UserRecipeInteraction.user_id == current_user.id,
            UserRecipeInteraction.liked == True
        ).all()
        liked_ids = [r[0] for r in liked_recipe_ids]
        
        # Parse session-excluded IDs (temporary exclusion)
        session_excluded_ids = []
        if exclude:
            try:
                session_excluded_ids = [int(x.strip()) for x in exclude.split(',') if x.strip()]
            except ValueError:
                logger.warning(f"Invalid exclude parameter: {exclude}. Skipping session_excluded_ids parsing.")
        
        # Combine exclusions
        excluded_ids = list(set(liked_ids + session_excluded_ids))
        
        # Base query
        query = db.query(Recipe)
        
        # Exclude already seen/liked recipes
        if excluded_ids:
            query = query.filter(~Recipe.id.in_(excluded_ids))
        
        # Check if user has pantry items
        pantry_items = db.query(PantryItem).filter(
            PantryItem.user_id == current_user.id
        ).all()
        
        if pantry_items:
            # User has pantry items - match recipes by ingredients
            ingredient_names = [item.ingredient_name.lower() for item in pantry_items]
            
            # Build OR conditions for LIKE matching
            ingredient_conditions = []
            for ingredient in ingredient_names:
                pattern = f'%{ingredient}%'
                ingredient_conditions.append(Recipe.ingredients.ilike(pattern))
            
            # Apply ingredient matching and limit initial query to prevent loading too many recipes
            if ingredient_conditions:
                query = query.filter(or_(*ingredient_conditions))
            
            # Fetch reasonable upper bound of recipes before scoring (e.g., 10x the limit)
            max_fetch = min(limit * 10, 500)  # Cap at 500 to prevent memory issues
            recipes = query.limit(max_fetch).all()
            
            # Score recipes by ingredient match count
            scored_recipes = []
            for recipe in recipes:
                recipe_ingredients_lower = recipe.ingredients.lower()
                match_count = sum(1 for ing in ingredient_names if ing in recipe_ingredients_lower)
                scored_recipes.append((recipe, match_count))
            
            # Sort by match count (highest first)
            scored_recipes.sort(key=lambda x: x[1], reverse=True)
            
            # Take top matches up to limit
            recipes = [recipe for recipe, _ in scored_recipes[:limit]]
        else:
            # No pantry items - return random recipes
            recipes = query.order_by(func.rand()).limit(limit).all()
        
        # Convert to minimal response
        result = [create_minimal_recipe_response(recipe) for recipe in recipes]
        
        logger.info(f"Returned {len(result)} recipes for user {current_user.id}")
        return result
        
    except Exception as e:
        logger.error(f"Error getting recipe feed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{recipe_id}/like", tags=["Recipes"])
async def like_recipe(
    recipe_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Like a recipe (right swipe)
    
    Creates a permanent like record and increments recipe like_count.
    """
    try:
        # Check if recipe exists
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        # Check if already liked
        existing = db.query(UserRecipeInteraction).filter(
            UserRecipeInteraction.user_id == current_user.id,
            UserRecipeInteraction.recipe_id == recipe_id,
            UserRecipeInteraction.liked == True
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Recipe already liked")
        
        # Create like interaction
        interaction = UserRecipeInteraction(
            user_id=current_user.id,
            recipe_id=recipe_id,
            liked=True
        )
        db.add(interaction)
        db.flush()  # Flush to ensure interaction is created before updating counter
        
        # Atomically increment like count to prevent race conditions
        db.execute(
            update(Recipe)
            .where(Recipe.id == recipe_id)
            .values(like_count=Recipe.like_count + 1)
        )
        
        db.commit()
        
        # Fetch updated like count
        db.refresh(recipe)
        
        logger.info(f"User {current_user.id} liked recipe {recipe_id}")
        return {
            "message": "Recipe liked successfully",
            "recipe_id": recipe_id,
            "like_count": recipe.like_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error liking recipe {recipe_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/liked", tags=["Recipes"])
async def get_liked_recipes(
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get user's liked recipes collection with pagination
    
    Returns recipes with minimal data plus liked_at timestamp.
    """
    try:
        # Calculate offset
        skip = (page - 1) * limit
        
        # Get total count
        total = db.query(UserRecipeInteraction).filter(
            UserRecipeInteraction.user_id == current_user.id,
            UserRecipeInteraction.liked == True
        ).count()
        
        # Get liked interactions with recipes
        interactions = db.query(UserRecipeInteraction, Recipe).join(
            Recipe, UserRecipeInteraction.recipe_id == Recipe.id
        ).filter(
            UserRecipeInteraction.user_id == current_user.id,
            UserRecipeInteraction.liked == True
        ).order_by(
            UserRecipeInteraction.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        # Build response
        recipes = []
        for interaction, recipe in interactions:
            recipe_data = create_minimal_recipe_response(recipe)
            recipe_data["liked_at"] = interaction.created_at.isoformat()
            recipes.append(recipe_data)
        
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        return {
            "recipes": recipes,
            "total": total,
            "page": page,
            "pages": total_pages
        }
        
    except Exception as e:
        logger.error(f"Error getting liked recipes: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{recipe_id}/like", tags=["Recipes"])
async def unlike_recipe(
    recipe_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: db_dependency
):
    """
    Unlike a recipe (remove from liked collection)
    
    Deletes the like record and decrements recipe like_count.
    """
    try:
        # Find the like interaction
        interaction = db.query(UserRecipeInteraction).filter(
            UserRecipeInteraction.user_id == current_user.id,
            UserRecipeInteraction.recipe_id == recipe_id,
            UserRecipeInteraction.liked == True
        ).first()
        
        if not interaction:
            raise HTTPException(status_code=404, detail="Like not found")
        
        # Delete the interaction
        db.delete(interaction)
        db.flush()  # Flush to ensure interaction is deleted before updating counter
        
        # Atomically decrement like count to prevent race conditions
        # Use CASE to ensure count doesn't go below 0
        db.execute(
            update(Recipe)
            .where(Recipe.id == recipe_id)
            .values(like_count=func.greatest(0, Recipe.like_count - 1))
        )
        
        db.commit()
        
        # Fetch updated like count
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        updated_like_count = recipe.like_count if recipe else 0
        
        logger.info(f"User {current_user.id} unliked recipe {recipe_id}")
        return {
            "message": "Recipe unliked successfully",
            "recipe_id": recipe_id,
            "like_count": updated_like_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unliking recipe {recipe_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{recipe_id}", response_model=RecipeResponse, tags=["Recipes"])
async def get_recipe_details(recipe_id: int, db: db_dependency):
    """
    Get full recipe details
    
    Returns complete recipe information including description,
    ingredients, and cooking instructions.
    
    This endpoint is public (no authentication required).
    """
    try:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        return RecipeResponse(
            id=recipe.id,
            name=recipe.name,
            description=recipe.description,
            prep_time=recipe.prep_time,
            cook_time=recipe.cook_time,
            difficulty=recipe.difficulty,
            image_url=recipe.image_url,
            instructions=recipe.instructions,
            created_at=recipe.created_at,
            ingredients=json.loads(recipe.ingredients),
            like_count=recipe.like_count,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting recipe {recipe_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
