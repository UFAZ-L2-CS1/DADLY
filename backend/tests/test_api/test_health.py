"""
Tests for health check endpoint
"""

import pytest


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    
    assert response.status_code == 200
    data = response.json()
    
    # Check response structure
    assert "status" in data
    assert "time_baku" in data  # Changed from "timestamp"
    assert data["status"] == "OK"


def test_health_check_no_auth_required(client):
    """Test that health check doesn't require authentication"""
    # Should work without Authorization header
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    
    # Should work with invalid Authorization header
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/api/v1/health", headers=headers)
    assert response.status_code == 200