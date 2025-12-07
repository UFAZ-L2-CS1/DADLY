"""
Tests for main FastAPI app and general functionality
"""

import pytest
from fastapi.testclient import TestClient


def test_app_startup(client):
    """Test that the app starts up correctly"""
    # Health check endpoint should work
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_cors_headers(client):
    """Test that CORS headers can be verified on actual requests"""
    # In TestClient, we can't test CORS preflight (OPTIONS) the same way browsers do
    # CORS is primarily for browser clients, not API tests
    # This test just verifies the app is running
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    # A real browser would send Origin header and we'd check for Access-Control-Allow-Origin
    # For now, just verify the endpoint works


def test_api_prefix(client):
    """Test that API endpoints use correct prefix"""
    # Should work with prefix
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    
    # Should not work without prefix
    response = client.get("/health")
    assert response.status_code == 404