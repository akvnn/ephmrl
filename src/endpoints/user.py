from fastapi import APIRouter, Depends
from src.models.user import User
from src.schemas.user import UserResponse
from src.utils import get_current_user_from_cookie

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me", response_model=UserResponse)
async def get_current_user(user: User = Depends(get_current_user_from_cookie)):
    """Get current authenticated user"""
    return user
