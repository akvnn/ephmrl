import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.schemas.form import FormBase
from src.models.form import Form

logger = logging.getLogger(__name__)


class FormCRUD:
    @staticmethod
    async def create(db: AsyncSession, form_data: FormBase) -> Form:
        form = Form(**form_data.model_dump())
        db.add(form)
        await db.commit()
        await db.refresh(form)
        return form

    @staticmethod
    async def get_all_forms(db: AsyncSession) -> list[Form]:
        query = select(Form)
        result = await db.execute(query)
        return list(result.scalars().all())
