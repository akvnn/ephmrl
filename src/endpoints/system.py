from fastapi import APIRouter, Security
from src.models.user import User
from src.utils import auth, get_current_user

router = APIRouter()


@router.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Test route
@router.get("/api/private")
def private(auth_result: str = Security(auth.verify)):
    """A valid access token is required to access this route"""
    return auth_result


# Test route 2
@router.get("/api/private2")
def private2(user: User = Security(get_current_user)):
    """A valid access token is required to access this route"""
    return user
