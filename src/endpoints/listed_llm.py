from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.crud.listed_llm import ListedLLMCRUD
from src.dependency import get_db
from src.schemas.pagination import PaginationRequest
from src.schemas.pagination import get_pagination_params
from src.schemas.listed_llm import ListedLLMResponse

router = APIRouter(prefix="/listed", tags=["listed_models"])


@router.get(
    "/models/all",
    response_model=list[ListedLLMResponse],
)
async def list_available_llms(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationRequest = Depends(get_pagination_params),
):
    """
    Public route.
    List all LLMs available for renting.
    """

    listed_llms = await ListedLLMCRUD.get_available(
        db=db, skip=pagination.skip, limit=pagination.limit
    )
    return listed_llms
