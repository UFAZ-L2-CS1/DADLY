"""
Recipe management and discovery endpoints for DADLY
Handles recipe operations, swiping, and recommendations
"""

import json
from datetime import datetime
from typing import Optional, Annotated
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy import func, or_, update, case
from sqlalchemy.exc import IntegrityError

from app.schemas.schemas import RecipeResponse
from app.db.database import db_dependency
from app.models.models import Recipe, User, UserRecipeInteraction, PantryItem
from app.config.config import get_logger
from app.api.auth import get_current_user, get_current_user_optional

router = APIRouter()
logger = get_logger(__name__)

# Constants for feed optimization and security
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
    db: db_dependency,
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None,
    limit: int = Query(20, ge=1, le=50),
    exclude: Optional[str] = Query(None, description="Comma-separated recipe IDs to exclude (session-based)")
):
    """
    Get recipe feed for swiping interface
    
    **Guest users (no authentication):**
    - Returns random recipes
    - No personalization
    - Cannot use 'exclude' parameter
    
    **Authenticated users (with login):**
    - Excludes already liked recipes (permanent)
    - Excludes session-excluded recipes (temporary via 'exclude' parameter)
    - Prioritizes recipes matching user's pantry items if available
    
    Returns minimal recipe data for performance.
    Use GET /recipes/{id} for full details.
    """
    try:
        # ===== GUEST USER PATH (no authentication) =====
        if current_user is None:
            # Simple random feed for guests - no personalization
            recipes = db.query(Recipe).order_by(func.random()).limit(limit).all()
            result = [create_minimal_recipe_response(recipe) for recipe in recipes]
            logger.info(f"Returned {len(result)} random recipes for guest user")
            return result
        
        # ===== AUTHENTICATED USER PATH (with login) ====
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
            
            # Build SQL-based scoring using CASE expressions for each ingredient
            # This moves scoring to database level for better performance (O(n) vs O(nmk))
            match_cases = []
            ingredient_conditions = []
            
            for ingredient in ingredient_names:
                # Escape SQL LIKE wildcards (% and _) to prevent unintended matching
                escaped_ingredient = ingredient.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
                pattern = f'%{escaped_ingredient}%'
                
                # Build CASE expression: 1 if match, 0 otherwise
                match_cases.append(
                    case(
                        (Recipe.ingredients.ilike(pattern, escape='\\'), 1),  # Positional tuple
                        else_=0
                    )
                )
                
                # Also build OR condition for filtering
                ingredient_conditions.append(Recipe.ingredients.ilike(pattern, escape='\\'))
            
            # Check if we have valid ingredients to match
            if not match_cases:
                # No valid pantry items to match - return random recipes
                recipes = query.order_by(func.random()).limit(limit).all()
            else:
                # Add computed match_count column by summing all CASE expressions
                # Chain CASE expressions with + operator to create proper SQL expression
                match_count_expr = match_cases[0]
                for case_expr in match_cases[1:]:
                    match_count_expr = match_count_expr + case_expr
                
                query = query.add_columns(match_count_expr.label('match_count'))
                
                # Order by match count (highest first), then random for recipes with same match count
                query = query.order_by(match_count_expr.desc(), func.random())
                query = query.limit(limit)
                
                # Execute query - results are tuples of (Recipe, match_count)
                results = query.all()
                recipes = [result[0] for result in results]
        else:
            # No pantry items - return random recipes
            recipes = query.order_by(func.random()).limit(limit).all()
        
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
    Relies on database unique constraint to prevent duplicate likes.
    """
    try:
        # Check if recipe exists first
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        # Create like interaction - rely on unique constraint to prevent duplicates
        # This is more efficient than checking first (avoids race condition window)
        interaction = UserRecipeInteraction(
            user_id=current_user.id,
            recipe_id=recipe_id,
            liked=True
        )
        db.add(interaction)
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
        db.rollback()
        # Check if it's the specific unique constraint violation we expect
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        
        if 'uq_user_recipe' in error_msg.lower() or 'duplicate' in error_msg.lower():
            # Unique constraint violation - duplicate like attempt (race condition)
            logger.warning(f"Duplicate like attempt by user {current_user.id} for recipe {recipe_id}")
            raise HTTPException(status_code=400, detail="Recipe already liked")
        else:
            # Other integrity error (foreign key, null constraint, etc.)
            logger.error(f"Integrity error while liking recipe {recipe_id} by user {current_user.id}: {error_msg}")
            raise HTTPException(status_code=500, detail="Database integrity error")
    except HTTPException:
        raise
    except Exception as e:
        # Catch any other database exceptions (connection issues, etc.) to ensure rollback
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
                # Use consistent timestamp format: YYYY-MM-DDTHH:MM:SS.ffffff
                # This handles 'Z' suffix and various ISO formats more reliably
                cursor = cursor.replace('Z', '+00:00')  # Handle UTC 'Z' notation
                cursor_dt = datetime.fromisoformat(cursor)
                query = query.filter(UserRecipeInteraction.created_at < cursor_dt)
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid cursor format: {cursor}, error: {e}")
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid cursor format. Expected ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SS.ffffff)."
                )
        
        # Order by created_at descending and limit
        interactions = query.order_by(
            UserRecipeInteraction.created_at.desc()
        ).limit(limit + 1).all()  # Fetch one extra to determine if there's a next page
        
        # Check if there are more results
        has_more = len(interactions) > limit
        if has_more:
            interactions = interactions[:limit]  # Remove the extra item
        
        # Build response with consistent timestamp format
        recipes = []
        next_cursor = None
        for interaction, recipe in interactions:
            recipe_data = create_minimal_recipe_response(recipe)
            # Use consistent format for cursor (includes microseconds for precision)
            timestamp = interaction.created_at.strftime('%Y-%m-%dT%H:%M:%S.%f')
            recipe_data["liked_at"] = timestamp
            recipes.append(recipe_data)  # Add to the list!
            next_cursor = timestamp  # Last item's timestamp
        
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
