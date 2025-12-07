"""
Tests for pantry management endpoints
"""

import pytest


class TestPantryList:
    """Test pantry listing functionality"""
    
    def test_get_pantry_no_auth(self, client):
        """Test getting pantry without authentication"""
        response = client.get("/api/v1/pantry/")
        
        assert response.status_code == 401
    
    def test_get_pantry_authenticated(self, client, authenticated_user):
        """Test getting pantry with authentication"""
        response = client.get("/api/v1/pantry/", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)


class TestAddIngredients:
    """Test adding ingredients to pantry"""
    
    def test_add_ingredient_no_auth(self, client):
        """Test adding ingredient without authentication"""
        ingredient_data = {"ingredient_name": "tomato", "quantity": "5"}
        response = client.post("/api/v1/pantry/", json=ingredient_data)
        
        assert response.status_code == 401
    
    def test_add_ingredient_valid(self, client, authenticated_user):
        """Test adding valid ingredient"""
        ingredient_data = {"ingredient_name": "tomato", "quantity": "5"}
        response = client.post(
            "/api/v1/pantry/", 
            json=ingredient_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "ingredient" in data
        assert data["ingredient"]["ingredient_name"] == "tomato"
        assert data["ingredient"]["quantity"] == "5"
    
    def test_add_ingredient_invalid_name(self, client, authenticated_user):
        """Test adding ingredient with invalid name"""
        # Empty name
        ingredient_data = {"ingredient_name": "", "quantity": "5"}
        response = client.post(
            "/api/v1/pantry/", 
            json=ingredient_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 422
    
    def test_add_ingredient_invalid_quantity(self, client, authenticated_user):
        """Test adding ingredient with invalid quantity"""
        # Purely numeric name
        ingredient_data = {"ingredient_name": "123", "quantity": "5"}
        response = client.post(
            "/api/v1/pantry/", 
            json=ingredient_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 422
    
    def test_add_duplicate_ingredient(self, client, authenticated_user):
        """Test adding duplicate ingredient"""
        ingredient_data = {"ingredient_name": "tomato", "quantity": "5"}
        
        # Add first time
        response = client.post(
            "/api/v1/pantry/", 
            json=ingredient_data, 
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 200
        
        # Try to add same ingredient again
        response = client.post(
            "/api/v1/pantry/", 
            json=ingredient_data, 
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()


class TestBulkAddIngredients:
    """Test bulk adding ingredients"""
    
    def test_bulk_add_no_auth(self, client):
        """Test bulk add without authentication"""
        bulk_data = {"ingredients": [{"ingredient_name": "tomato", "quantity": "5"}]}
        response = client.post("/api/v1/pantry/bulk", json=bulk_data)
        
        assert response.status_code == 401
    
    def test_bulk_add_valid(self, client, authenticated_user):
        """Test bulk adding valid ingredients"""
        bulk_data = {
            "ingredients": [
                {"ingredient_name": "tomato", "quantity": "5"},
                {"ingredient_name": "onion", "quantity": "3"}
            ]
        }
        response = client.post(
            "/api/v1/pantry/bulk", 
            json=bulk_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["added_count"] >= 0
        assert data["skipped_count"] >= 0
        assert isinstance(data["added"], list)
        assert isinstance(data["skipped"], list)
    
    def test_bulk_add_empty_list(self, client, authenticated_user):
        """Test bulk add with empty ingredients list"""
        bulk_data = {"ingredients": []}
        response = client.post(
            "/api/v1/pantry/bulk", 
            json=bulk_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 400




class TestDeleteIngredient:
    """Test deleting pantry ingredients"""
    
    def test_delete_ingredient_no_auth(self, client):
        """Test deleting ingredient without authentication"""
        response = client.delete("/api/v1/pantry/1")
        
        assert response.status_code == 401
    
    def test_delete_nonexistent_ingredient(self, client, authenticated_user):
        """Test deleting non-existent ingredient"""
        response = client.delete(
            "/api/v1/pantry/999", 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 404


class TestClearPantry:
    """Test clearing entire pantry"""
    
    def test_clear_pantry_no_auth(self, client):
        """Test clearing pantry without authentication"""
        response = client.delete("/api/v1/pantry/")
        
        assert response.status_code == 401
    
    def test_clear_pantry_authenticated(self, client, authenticated_user):
        """Test clearing pantry with authentication"""
        response = client.delete("/api/v1/pantry/", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert "deleted_count" in data