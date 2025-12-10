"""
Tests for user management endpoints
"""

import pytest


class TestUserProfile:
    """Test user profile management"""
    
    def test_update_profile_no_auth(self, client):
        """Test updating profile without authentication"""
        update_data = {"name": "New Name"}
        response = client.put("/api/v1/users/profile", json=update_data)
        
        assert response.status_code == 401
    
    def test_update_profile_valid(self, client, authenticated_user):
        """Test updating profile with valid data"""
        update_data = {
            "name": "Updated Name",
            "dietary_type": "vegetarian"
        }
        response = client.put(
            "/api/v1/users/profile", 
            json=update_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == "Updated Name"
        assert data["dietary_type"] == "vegetarian"
    
    def test_update_profile_empty_name(self, client, authenticated_user):
        """Test updating profile with empty name"""
        update_data = {"name": "   "}  # Whitespace only
        response = client.put(
            "/api/v1/users/profile", 
            json=update_data, 
            headers=authenticated_user["headers"]
        )
        
        # Pydantic validates whitespace-only strings and rejects with 422
        assert response.status_code == 422
    
    def test_update_profile_no_fields(self, client, authenticated_user):
        """Test updating profile with no fields provided"""
        update_data = {}
        response = client.put(
            "/api/v1/users/profile", 
            json=update_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 400
        assert "no fields" in response.json()["detail"].lower()
    
    def test_update_profile_invalid_dietary_type(self, client, authenticated_user):
        """Test updating profile with invalid dietary type"""
        update_data = {"dietary_type": "invalid_type"}
        response = client.put(
            "/api/v1/users/profile", 
            json=update_data, 
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 422  # Validation error


class TestDeleteAccount:
    """Test account deletion"""
    
    def test_delete_account_no_auth(self, client):
        """Test deleting account without authentication"""
        delete_data = {"password": "password"}
        response = client.request(
            "DELETE",
            "/api/v1/users/profile",
            json=delete_data
        )
        
        assert response.status_code == 401
    
    def test_delete_account_valid_password(self, client, authenticated_user, sample_user_data):
        """Test deleting account with correct password"""
        delete_data = {"password": sample_user_data["password"]}
        response = client.request(
            "DELETE",
            "/api/v1/users/profile",
            json=delete_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "deleted successfully" in data["message"]
        assert "recipes_unliked" in data
    
    def test_delete_account_invalid_password(self, client, authenticated_user):
        """Test deleting account with incorrect password"""
        delete_data = {"password": "wrongpassword"}
        response = client.request(
            "DELETE",
            "/api/v1/users/profile",
            json=delete_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 401
        assert "incorrect password" in response.json()["detail"].lower()
    
    def test_delete_account_no_password(self, client, authenticated_user):
        """Test deleting account without password"""
        delete_data = {}
        response = client.request(
            "DELETE",
            "/api/v1/users/profile",
            json=delete_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 422  # Validation error


class TestUserStats:
    """Test user statistics"""
    
    def test_get_stats_no_auth(self, client):
        """Test getting stats without authentication"""
        response = client.get("/api/v1/users/stats")
        
        assert response.status_code == 401
    
    def test_get_stats_authenticated(self, client, authenticated_user):
        """Test getting stats with authentication"""
        response = client.get("/api/v1/users/stats", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_recipes_liked" in data
        assert "total_pantry_items" in data
        assert "account_created_at" in data
        assert "days_active" in data
        
        # Verify data types
        assert isinstance(data["total_recipes_liked"], int)
        assert isinstance(data["total_pantry_items"], int)
        assert isinstance(data["days_active"], int)
        assert data["total_recipes_liked"] >= 0
        assert data["total_pantry_items"] >= 0
        assert data["days_active"] >= 0