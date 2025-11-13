from fastapi import APIRouter, Depends
from src.models.user import User
from src.utils import auth, get_current_user_from_cookie

router = APIRouter()


@router.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Test route
@router.get("/api/private")
async def private(auth_result: str = Depends(auth.verify_from_cookie)):
    """A valid access token is required to access this route"""
    return auth_result


# Test route 2
@router.get("/api/private2")
async def private2(user: User = Depends(get_current_user_from_cookie)):
    """A valid access token is required to access this route"""
    return user
