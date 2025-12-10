"""
Tests for authentication endpoints
"""

import pytest


class TestUserRegistration:
    """Test user registration functionality"""
    
    def test_register_new_user(self, client, sample_user_data):
        """Test registering a new user"""
        response = client.post("/api/v1/auth/register", json=sample_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == sample_user_data["email"]
        assert data["name"] == sample_user_data["name"]
        assert "id" in data
        assert "hashed_password" not in data  # Should not return password
    
    def test_register_duplicate_email(self, client, sample_user_data):
        """Test registering with duplicate email"""
        # Register first user
        response = client.post("/api/v1/auth/register", json=sample_user_data)
        assert response.status_code == 200
        
        # Try to register again with same email
        response = client.post("/api/v1/auth/register", json=sample_user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_register_invalid_email(self, client, sample_user_data):
        """Test registering with invalid email"""
        sample_user_data["email"] = "invalid-email"
        response = client.post("/api/v1/auth/register", json=sample_user_data)
        assert response.status_code == 422  # Validation error


class TestUserLogin:
    """Test user login functionality"""
    
    def test_login_valid_credentials(self, client, sample_user_data):
        """Test login with valid credentials"""
        # First register a user
        client.post("/api/v1/auth/register", json=sample_user_data)
        
        # Then login
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/api/v1/auth/token", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_email(self, client):
        """Test login with invalid email"""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "password"
        }
        response = client.post("/api/v1/auth/token", data=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_invalid_password(self, client, sample_user_data):
        """Test login with invalid password"""
        # Register user first
        client.post("/api/v1/auth/register", json=sample_user_data)
        
        # Try login with wrong password
        login_data = {
            "username": sample_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/v1/auth/token", data=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]


class TestUserProfile:
    """Test user profile endpoints"""
    
    def test_get_current_user(self, client, authenticated_user):
        """Test getting current user profile"""
        response = client.get("/api/v1/auth/me", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert "email" in data
        assert "name" in data
        assert "hashed_password" not in data
    
    def test_get_current_user_no_auth(self, client):
        """Test getting current user without authentication"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401


class TestTokenRefresh:
    """Test token refresh functionality"""
    
    def test_refresh_token_valid(self, client, sample_user_data):
        """Test refreshing token with valid refresh token"""
        # Register and login
        client.post("/api/v1/auth/register", json=sample_user_data)
        
        login_data = {
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        login_response = client.post("/api/v1/auth/token", data=login_data)
        tokens = login_response.json()
        
        # Refresh token
        refresh_data = {"refresh_token": tokens["refresh_token"]}
        response = client.post("/api/v1/auth/refresh", json=refresh_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_refresh_token_invalid(self, client):
        """Test refreshing with invalid refresh token"""
        refresh_data = {"refresh_token": "invalid_refresh_token"}
        response = client.post("/api/v1/auth/refresh", json=refresh_data)
        
        assert response.status_code == 401


class TestLogout:
    """Test logout functionality"""
    
    def test_logout_valid_token(self, client, authenticated_user):
        """Test logout with valid token"""
        response = client.post("/api/v1/auth/logout", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        assert "logged out" in response.json()["message"]
    
    def test_logout_no_auth(self, client):
        """Test logout without authentication"""
        response = client.post("/api/v1/auth/logout")
        
        assert response.status_code == 401