"""
Recipe management and discovery endpoints for DADLY
Handles recipe operations, swiping, and recommendations
"""

import json
import random
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.schemas import (
    RecipeResponse,
    # SwipeResponse,  # Commented out for MVP
    # RecipeMatch,    # Commented out for MVP
    DifficultyLevel,
    DietaryType,
)
from app.db.database import db_dependency
from app.models.models import Recipe, User, UserRecipeInteraction
from app.config.config import get_logger

router = APIRouter()
logger = get_logger(__name__)

# For now, use a hardcoded test user ID (we'll replace this with real auth later)
TEST_USER_ID = 1


# Recipe Discovery & Swiping
@router.get("/swipe", response_model=RecipeResponse, tags=["Recipes"])
async def get_next_recipe(db: db_dependency):
    """
    Get next recipe for swiping interface

    Returns a recipe the user hasn't seen before,
    filtered by dietary preferences
    """
    try:
        # Get recipes the user hasn't interacted with
        seen_recipe_ids = (
            db.query(UserRecipeInteraction.recipe_id)
            .filter(UserRecipeInteraction.user_id == TEST_USER_ID)
            .all()
        )
        seen_ids = [r[0] for r in seen_recipe_ids]

        # Get unseen recipes
        query = db.query(Recipe)
        if seen_ids:
            query = query.filter(~Recipe.id.in_(seen_ids))

        recipes = query.all()

        if not recipes:
            raise HTTPException(status_code=404, detail="No more recipes to show")

        # Pick a random recipe
        recipe = random.choice(recipes)

        # Convert to response model
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

    except Exception as e:
        logger.error(f"Error getting next recipe: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/swipe", tags=["Recipes"])
async def swipe_recipe(recipe_id: int, liked: bool, db: db_dependency):
    """
    Record user's swipe action on a recipe

    - **recipe_id**: ID of the swiped recipe
    - **liked**: True for like (right swipe), False for dislike (left swipe)

    Returns the next recipe to show after this swipe
    """
    try:
        # Check if recipe exists
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")

        # Check if user already interacted with this recipe
        existing = (
            db.query(UserRecipeInteraction)
            .filter(
                UserRecipeInteraction.user_id == TEST_USER_ID,
                UserRecipeInteraction.recipe_id == recipe_id,
            )
            .first()
        )

        if existing:
            # Update existing interaction
            existing.liked = liked
        else:
            # Create new interaction
            interaction = UserRecipeInteraction(
                user_id=TEST_USER_ID, recipe_id=recipe_id, liked=liked
            )
            db.add(interaction)

        # Update recipe like count
        if liked:
            if not existing or not existing.liked:
                recipe.like_count += 1
        else:
            if existing and existing.liked:
                recipe.like_count = max(0, recipe.like_count - 1)

        db.commit()

        return {"status": "success", "recipe_id": recipe_id, "liked": liked}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing swipe: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


# Recipe Collections
@router.get("/liked", response_model=List[RecipeResponse], tags=["Recipes"])
async def get_liked_recipes(
    db: db_dependency,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    """
    Get user's liked (saved) recipes with pagination

    - **skip**: Number of recipes to skip (for pagination)
    - **limit**: Maximum number of recipes to return
    """
    try:
        # Get liked recipe IDs
        liked_interactions = (
            db.query(UserRecipeInteraction)
            .filter(
                UserRecipeInteraction.user_id == TEST_USER_ID,
                UserRecipeInteraction.liked == True,
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

        liked_recipe_ids = [i.recipe_id for i in liked_interactions]

        if not liked_recipe_ids:
            return []

        # Get the actual recipes
        recipes = db.query(Recipe).filter(Recipe.id.in_(liked_recipe_ids)).all()

        # Convert to response models
        result = []
        for recipe in recipes:
            result.append(
                RecipeResponse(
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
            )

        return result

    except Exception as e:
        logger.error(f"Error getting liked recipes: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/liked/{recipe_id}", tags=["Recipes"])
async def unlike_recipe(recipe_id: int, db: db_dependency):
    """
    Remove recipe from user's liked collection
    """
    try:
        # Find the interaction
        interaction = (
            db.query(UserRecipeInteraction)
            .filter(
                UserRecipeInteraction.user_id == TEST_USER_ID,
                UserRecipeInteraction.recipe_id == recipe_id,
                UserRecipeInteraction.liked == True,
            )
            .first()
        )

        if not interaction:
            raise HTTPException(status_code=404, detail="Liked recipe not found")

        # Update the interaction to unliked
        interaction.liked = False

        # Update recipe like count
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if recipe:
            recipe.like_count = max(0, recipe.like_count - 1)

        db.commit()
        return {"message": "Recipe unliked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unliking recipe {recipe_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{recipe_id}", response_model=RecipeResponse, tags=["Recipes"])
async def get_recipe(recipe_id: int, db: db_dependency):
    """
    Get detailed information about a specific recipe
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


# Recipe Discovery & Search
@router.get("/", response_model=List[RecipeResponse], tags=["Recipes"])
async def search_recipes(
    db: db_dependency,
    q: Optional[str] = Query(None, description="Search query"),
    difficulty: Optional[DifficultyLevel] = None,
    max_prep_time: Optional[int] = Query(None, ge=0),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    """
    Search and filter recipes

    - **q**: Search in recipe name and description
    - **difficulty**: Filter by difficulty level
    - **max_prep_time**: Maximum prep time in minutes
    """
    try:
        query = db.query(Recipe)

        # Apply filters
        if q:
            search = f"%{q}%"
            query = query.filter(
                (Recipe.name.ilike(search)) | (Recipe.description.ilike(search))
            )

        if difficulty:
            query = query.filter(Recipe.difficulty == difficulty.value)

        if max_prep_time:
            query = query.filter(Recipe.prep_time <= max_prep_time)

        # Apply pagination
        recipes = query.offset(skip).limit(limit).all()

        # Convert to response models
        result = []
        for recipe in recipes:
            result.append(
                RecipeResponse(
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
            )

        return result

    except Exception as e:
        logger.error(f"Error searching recipes: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/trending", response_model=List[RecipeResponse], tags=["Recipes"])
async def get_trending_recipes(
    db: db_dependency,
    timeframe: str = Query("week", regex="^(day|week|month)$"),
    limit: int = Query(10, le=50),
):
    """
    Get trending recipes based on recent likes

    - **timeframe**: Time period for trending calculation
    - **limit**: Number of recipes to return
    """
    try:
        # For now, just return recipes with highest like count
        # TODO: Add time-based filtering for trending
        recipes = db.query(Recipe).order_by(Recipe.like_count.desc()).limit(limit).all()

        result = []
        for recipe in recipes:
            result.append(
                RecipeResponse(
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
            )

        return result

    except Exception as e:
        logger.error(f"Error getting trending recipes: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
