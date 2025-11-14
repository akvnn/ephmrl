from datetime import datetime
from pydantic import BaseModel


class RoleInfo(BaseModel):
    name: str
    assigned_at: datetime | None = None
