from pydantic import BaseModel


class InstallPluginRequest(BaseModel):
    organization_id: str
    plugin_slug: str