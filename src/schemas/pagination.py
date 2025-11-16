from pydantic import BaseModel
from fastapi import Query


class PaginationRequest(BaseModel):
    skip: int
    limit: int


class SearchPaginationRequest(PaginationRequest):
    q: str


async def get_pagination_params(
    skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100)
) -> PaginationRequest:
    """Get request pagination params"""
    return PaginationRequest(skip=skip, limit=limit)


async def get_search_pagination_params(
    q: str = Query(..., min_length=1, description="Search term"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> SearchPaginationRequest:
    """Get request search pagination params"""
    return SearchPaginationRequest(q=q, skip=skip, limit=limit)
