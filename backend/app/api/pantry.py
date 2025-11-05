"""
Pantry and ingredient management endpoints for DADLY
Handles user's pantry items and ingredient tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from typing import List
from app.schemas.schemas import PantryItem

router = APIRouter()
security = HTTPBearer()


@router.get("/", tags=["Pantry"])
async def get_pantry_ingredients(token: str = Depends(security)):
    """
    Get all ingredients in user's pantry

    Returns list of pantry items with quantities and dates added
    """
    # TODO: Implement get pantry
    # - Extract user ID from token
    # - Fetch user's pantry items
    # - Return ingredient list
    pass


@router.post("/ingredients", tags=["Pantry"])
async def add_pantry_ingredient(
    ingredient_name: str, quantity: str = None, token: str = Depends(security)
):
    """
    Add ingredient to user's pantry

    - **ingredient_name**: Name of the ingredient
    - **quantity**: Optional quantity (e.g., "2 cups", "500g")
    """
    # TODO: Implement add ingredient
    # - Extract user ID from token
    # - Add ingredient to pantry
    # - Return success message
    pass


@router.post("/ingredients/bulk", tags=["Pantry"])
async def add_multiple_ingredients(
    ingredients: List[str], token: str = Depends(security)
):
    """
    Add multiple ingredients to pantry at once

    - **ingredients**: List of ingredient names
    """
    # TODO: Implement bulk add
    # - Extract user ID from token
    # - Add all ingredients to pantry
    # - Return success count
    pass


@router.put("/ingredients/{ingredient_id}", tags=["Pantry"])
async def update_pantry_ingredient(
    ingredient_id: int,
    ingredient_name: str = None,
    quantity: str = None,
    token: str = Depends(security),
):
    """
    Update existing pantry ingredient
    """
    # TODO: Implement update ingredient
    # - Verify ingredient belongs to user
    # - Update ingredient details
    # - Return updated ingredient
    pass


@router.delete("/ingredients/{ingredient_id}", tags=["Pantry"])
async def remove_pantry_ingredient(ingredient_id: int, token: str = Depends(security)):
    """
    Remove ingredient from pantry
    """
    # TODO: Implement remove ingredient
    # - Verify ingredient belongs to user
    # - Delete ingredient from pantry
    # - Return success message
    pass


@router.delete("/clear", tags=["Pantry"])
async def clear_pantry(token: str = Depends(security)):
    """
    Clear all ingredients from pantry
    """
    # TODO: Implement clear pantry
    # - Extract user ID from token
    # - Delete all user's pantry items
    # - Return success message
    pass


@router.post("/ingredients/{ingredient_id}/use", tags=["Pantry"])
async def mark_ingredient_used(
    ingredient_id: int, amount_used: str = None, token: str = Depends(security)
):
    """
    Mark ingredient as used (reduce quantity or remove)

    - **amount_used**: Optional amount used (for quantity tracking)
    """
    # TODO: Implement mark as used
    # - Verify ingredient belongs to user
    # - Update or remove based on usage
    # - Return updated ingredient or success
    pass
