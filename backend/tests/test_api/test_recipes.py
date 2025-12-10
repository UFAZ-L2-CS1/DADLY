"""
Tests for recipe endpoints
"""

import pytest


class TestRecipeFeed:
    """Test recipe feed functionality"""
    
    def test_get_feed_guest_user(self, client):
        """Test getting recipe feed as guest (no authentication)"""
        client
        response = client.get("/api/v1/recipes/feed")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # Should return recipes (if any exist in test db)
        # Note: might be empty if no test data
    
    def test_get_feed_authenticated_user(self, client, authenticated_user):
        """Test getting recipe feed as authenticated user"""
        response = client.get("/api/v1/recipes/feed", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
    
    def test_get_feed_with_limit(self, client):
        """Test feed with limit parameter"""
        response = client.get("/api/v1/recipes/feed?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) <= 5
    
    def test_get_feed_invalid_limit(self, client):
        """Test feed with invalid limit"""
        # Limit too high
        response = client.get("/api/v1/recipes/feed?limit=100")
        assert response.status_code == 422
        
        # Limit too low
        response = client.get("/api/v1/recipes/feed?limit=0")
        assert response.status_code == 422


class TestRecipeDetails:
    """Test recipe details endpoint"""
    
    def test_get_recipe_details_nonexistent(self, client):
        """Test getting details for non-existent recipe"""
        response = client.get("/api/v1/recipes/999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_recipe_details_no_auth_required(self, client):
        """Test that recipe details don't require authentication"""
        # Should work without token (even if recipe doesn't exist)
        response = client.get("/api/v1/recipes/999")
        # 404 for non-existent recipe, not 401 for unauthorized
        assert response.status_code == 404


class TestRecipeLikes:
    """Test recipe like/unlike functionality"""
    
    def test_like_recipe_no_auth(self, client):
        """Test liking recipe without authentication"""
        response = client.post("/api/v1/recipes/1/like")
        
        assert response.status_code == 401
    
    def test_like_nonexistent_recipe(self, client, authenticated_user):
        """Test liking non-existent recipe"""
        response = client.post("/api/v1/recipes/999/like", headers=authenticated_user["headers"])
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_unlike_recipe_no_auth(self, client):
        """Test unliking recipe without authentication"""
        response = client.delete("/api/v1/recipes/1/like")
        
        assert response.status_code == 401
    
    def test_unlike_nonexistent_recipe(self, client, authenticated_user):
        """Test unliking non-existent recipe"""
        response = client.delete("/api/v1/recipes/999/like", headers=authenticated_user["headers"])
        
        assert response.status_code == 404


class TestLikedRecipes:
    """Test liked recipes collection"""
    
    def test_get_liked_recipes_no_auth(self, client):
        """Test getting liked recipes without authentication"""
        response = client.get("/api/v1/recipes/liked")
        
        assert response.status_code == 401
    
    def test_get_liked_recipes_authenticated(self, client, authenticated_user):
        """Test getting liked recipes with authentication"""
        response = client.get("/api/v1/recipes/liked", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert "recipes" in data
        assert "next_cursor" in data
        assert "has_more" in data
        assert isinstance(data["recipes"], list)
    
    def test_get_liked_recipes_with_limit(self, client, authenticated_user):
        """Test liked recipes with limit parameter"""
        response = client.get("/api/v1/recipes/liked?limit=5", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["recipes"]) <= 5
    
    def test_get_liked_recipes_invalid_cursor(self, client, authenticated_user):
        """Test liked recipes with invalid cursor"""
        response = client.get(
            "/api/v1/recipes/liked?cursor=invalid", 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 400
        assert "cursor" in response.json()["detail"].lower()