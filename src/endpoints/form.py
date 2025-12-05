from fastapi import APIRouter, status, Depends, HTTPException
from src.models.form import Form
from src.schemas.form import FormBase
from sqlalchemy.ext.asyncio import AsyncSession
from src.dependency import get_db
from src.crud.form import FormCRUD
from loguru import logger


router = APIRouter(prefix="/form", tags=["form"])


@router.post("", response_model=FormBase, status_code=status.HTTP_201_CREATED)
async def submit_form(form_data: FormBase, db: AsyncSession = Depends(get_db)):
    try:
        created_form = await FormCRUD.create(db=db, form_data=form_data)
        return FormBase.model_validate(created_form)
    except Exception as e:
        logger.error(f"Error submitting form: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

