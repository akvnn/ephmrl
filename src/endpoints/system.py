from fastapi import APIRouter, Security

from src.utils import VerifyToken

router = APIRouter()
auth = VerifyToken()


@router.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Test route
@router.get("/api/private")
# 👈 Use Security and the verify method to protect your endpoints
def private(auth_result: str = Security(auth.verify)):
    """A valid access token is required to access this route"""
    return auth_result
