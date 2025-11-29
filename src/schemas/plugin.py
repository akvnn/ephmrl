from pydantic import BaseModel
import datetime


class InstallPluginRequest(BaseModel):
    organization_id: str
    plugin_slug: str


class PluginResponse(BaseModel):
    plugin_slug: str
    status: bool
    created_at: datetime.datetime
