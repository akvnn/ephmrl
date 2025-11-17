from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from datetime import datetime
import uuid

from src.models.project import Project
from src.schemas.project import ProjectCreate, ProjectUpdate


class ProjectCRUD:
    """CRUD operations for Project model"""

    @staticmethod
    async def create(
        db: AsyncSession,
        project_data: ProjectCreate,
        user_id: uuid.UUID,
        org_id: uuid.UUID,
    ) -> Project:
        """Create a new project"""
        project = Project(
            org_id=org_id,
            user_id=user_id,
            name=project_data.name,
            description=project_data.description,
            additional_metadata=project_data.additional_metadata or {},
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        project_id: uuid.UUID,
        org_id: uuid.UUID,
        include_deleted: bool = False,
    ) -> Project | None:
        """Get a project by ID within an organization"""
        query = select(Project).where(
            and_(
                Project.id == project_id,
                Project.org_id == org_id,
            )
        )

        if not include_deleted:
            query = query.where(Project.deleted_at.is_(None))

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id_with_relations(
        db: AsyncSession,
        project_id: uuid.UUID,
        org_id: uuid.UUID,
        include_deleted: bool = False,
    ) -> Project | None:
        """Get a project with related organization"""
        query = (
            select(Project)
            .options(selectinload(Project.organization))
            .where(
                and_(
                    Project.id == project_id,
                    Project.org_id == org_id,
                )
            )
        )

        if not include_deleted:
            query = query.where(Project.deleted_at.is_(None))

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        org_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> list[Project]:
        """Get all projects for an organization"""
        query = select(Project).where(Project.org_id == org_id)

        if not include_deleted:
            query = query.where(Project.deleted_at.is_(None))

        query = query.offset(skip).limit(limit).order_by(Project.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        org_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> list[Project]:
        """Get all projects created by a specific user"""
        query = select(Project).where(
            and_(
                Project.user_id == user_id,
                Project.org_id == org_id,
            )
        )

        if not include_deleted:
            query = query.where(Project.deleted_at.is_(None))

        query = query.offset(skip).limit(limit).order_by(Project.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update(
        db: AsyncSession,
        project_id: uuid.UUID,
        org_id: uuid.UUID,
        project_data: ProjectUpdate,
    ) -> Project | None:
        """Update a project"""
        project = await ProjectCRUD.get_by_id(db, project_id, org_id)

        if not project:
            return None

        update_data = project_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(project, field, value)

        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def update_metadata(
        db: AsyncSession,
        project_id: uuid.UUID,
        org_id: uuid.UUID,
        metadata: dict,
        merge: bool = True,
    ) -> Project | None:
        """Update project metadata (merge or replace)"""
        project = await ProjectCRUD.get_by_id(db, project_id, org_id)

        if not project:
            return None

        if merge:
            current_metadata = project.additional_metadata or {}
            current_metadata.update(metadata)
            project.additional_metadata = current_metadata
        else:
            project.additional_metadata = metadata

        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def soft_delete(
        db: AsyncSession,
        project_id: uuid.UUID,
        org_id: uuid.UUID,
    ) -> bool:
        """Soft delete a project"""
        project = await ProjectCRUD.get_by_id(db, project_id, org_id)

        if not project:
            return False

        project.deleted_at = datetime.utcnow()
        await db.commit()
        return True

    @staticmethod
    async def restore(
        db: AsyncSession,
        project_id: uuid.UUID,
        org_id: uuid.UUID,
    ) -> Project | None:
        """Restore a soft-deleted project"""
        project = await ProjectCRUD.get_by_id(
            db, project_id, org_id, include_deleted=True
        )

        if not project or not project.deleted_at:
            return None

        project.deleted_at = None
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def hard_delete(
        db: AsyncSession,
        project_id: uuid.UUID,
        org_id: uuid.UUID,
    ) -> bool:
        """Permanently delete a project"""
        project = await ProjectCRUD.get_by_id(
            db, project_id, org_id, include_deleted=True
        )

        if not project:
            return False

        await db.delete(project)
        await db.commit()
        return True

    @staticmethod
    async def count(
        db: AsyncSession,
        org_id: uuid.UUID,
        include_deleted: bool = False,
    ) -> int:
        """Count projects in an organization"""
        from sqlalchemy import func as sql_func

        query = select(sql_func.count(Project.id)).where(Project.org_id == org_id)

        if not include_deleted:
            query = query.where(Project.deleted_at.is_(None))

        result = await db.execute(query)
        return result.scalar_one()

    @staticmethod
    async def search_by_name(
        db: AsyncSession,
        org_id: uuid.UUID,
        search_term: str,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> list[Project]:
        """Search projects by name"""
        query = select(Project).where(
            and_(
                Project.org_id == org_id,
                Project.name.ilike(f"%{search_term}%"),
            )
        )

        if not include_deleted:
            query = query.where(Project.deleted_at.is_(None))

        query = query.offset(skip).limit(limit).order_by(Project.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())
