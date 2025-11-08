"""
Recipe management and discovery endpoints for DADLY
Handles recipe operations, swiping, and recommendations
"""

import json
from typing import Optional, Annotated
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy import func, or_, update
from sqlalchemy.exc import IntegrityError

from app.schemas.schemas import RecipeResponse
from app.db.database import db_dependency
from app.models.models import Recipe, User, UserRecipeInteraction, PantryItem
from app.config.config import get_logger
from app.api.auth import get_current_user

router = APIRouter()
logger = get_logger(__name__)

# Constants for feed optimization and security
FETCH_MULTIPLIER = 10  # Fetch 10x the requested limit to allow scoring/sorting before final selection
MAX_FETCH_RECIPES = 500  # Absolute cap to prevent memory exhaustion
MAX_EXCLUDE_IDS = 100  # Maximum number of excluded recipe IDs to prevent abuse
MAX_EXCLUDE_LENGTH = 1000  # Maximum length of exclude parameter string


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
            UserRecipeInteraction.liked.is_(True)
        ).all()
        liked_ids = [r[0] for r in liked_recipe_ids]
        
        # Parse session-excluded IDs (temporary exclusion) with validation
        session_excluded_ids = []
        if exclude:
            # Validate exclude parameter length to prevent DoS
            if len(exclude) > MAX_EXCLUDE_LENGTH:
                logger.warning(f"Exclude parameter too long ({len(exclude)} > {MAX_EXCLUDE_LENGTH} chars).")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Exclude parameter too long (max {MAX_EXCLUDE_LENGTH} chars)."
                )
            
            try:
                exclude_items = [x.strip() for x in exclude.split(',') if x.strip()]
                
                # Validate number of excluded IDs to prevent abuse
                if len(exclude_items) > MAX_EXCLUDE_IDS:
                    logger.warning(f"Too many IDs in exclude parameter ({len(exclude_items)} > {MAX_EXCLUDE_IDS}).")
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Too many excluded IDs (max {MAX_EXCLUDE_IDS})."
                    )
                
                session_excluded_ids = [int(x) for x in exclude_items]
            except ValueError:
                logger.warning(f"Invalid exclude parameter: {exclude}. Contains non-integer values.")
                raise HTTPException(status_code=400, detail="Exclude parameter must contain valid integer IDs.")
        
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
            
            # Fetch upper bound: enough recipes to score and select best matches, but not all
            # FETCH_MULTIPLIER allows filtering out low-score matches after scoring
            max_fetch = min(limit * FETCH_MULTIPLIER, MAX_FETCH_RECIPES)
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
            UserRecipeInteraction.liked.is_(True)
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
        
        try:
            db.flush()  # Flush to check for unique constraint violation
            
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
        except IntegrityError as e:
            # Database-level unique constraint violation (race condition caught)
            db.rollback()
            logger.warning(f"Duplicate like attempt by user {current_user.id} for recipe {recipe_id}: {e}")
            raise HTTPException(status_code=400, detail="Recipe already liked")
        
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
    limit: int = Query(20, ge=1, le=100),
    cursor: Optional[str] = Query(None, description="Cursor for pagination (ISO timestamp from previous response)"),
):
    """
    Get user's liked recipes collection with cursor-based pagination
    
    Uses cursor-based pagination (via created_at timestamp) for better performance
    with large datasets compared to offset-based pagination.
    
    Returns recipes with minimal data plus liked_at timestamp.
    Pass the 'next_cursor' from the response to get the next page.
    """
    try:
        # Base query
        query = db.query(UserRecipeInteraction, Recipe).join(
            Recipe, UserRecipeInteraction.recipe_id == Recipe.id
        ).filter(
            UserRecipeInteraction.user_id == current_user.id,
            UserRecipeInteraction.liked.is_(True)
        )
        
        # Apply cursor if provided (fetch records older than cursor timestamp)
        if cursor:
            try:
                from datetime import datetime
                cursor_dt = datetime.fromisoformat(cursor)
                query = query.filter(UserRecipeInteraction.created_at < cursor_dt)
            except (ValueError, TypeError):
                logger.warning(f"Invalid cursor format: {cursor}")
                raise HTTPException(status_code=400, detail="Invalid cursor format. Use ISO timestamp.")
        
        # Order by created_at descending and limit
        interactions = query.order_by(
            UserRecipeInteraction.created_at.desc()
        ).limit(limit + 1).all()  # Fetch one extra to determine if there's a next page
        
        # Check if there are more results
        has_more = len(interactions) > limit
        if has_more:
            interactions = interactions[:limit]  # Remove the extra item
        
        # Build response
        recipes = []
        next_cursor = None
        for interaction, recipe in interactions:
            recipe_data = create_minimal_recipe_response(recipe)
            recipe_data["liked_at"] = interaction.created_at.isoformat()
            recipes.append(recipe_data)
            next_cursor = interaction.created_at.isoformat()  # Last item's timestamp
        
        return {
            "recipes": recipes,
            "next_cursor": next_cursor if has_more else None,
            "has_more": has_more
        }
        
    except HTTPException:
        raise
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
            UserRecipeInteraction.liked.is_(True)
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
