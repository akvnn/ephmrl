from pydantic import BaseModel, ConfigDict
import datetime
from uuid import UUID


class MachineBase(BaseModel):
    id: UUID
    name: str
    ip_address: str
    region: str
    location: str | None = None
    provider: str
    provider_type: str
    status: str
    total_number_of_gpus: int
    available_number_of_gpus: int
    specs: dict
    created_at: datetime.datetime
    deleted_at: datetime.datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class GPUBase(BaseModel):
    id: UUID
    name: str
    vram_gb: int
    cuda_cores: int
    specs: dict
    current_utilization: int
    max_utilization: int
    status: str

    created_at: datetime.datetime
    deleted_at: datetime.datetime | None = None

    machine: MachineBase | None = None

    model_config = ConfigDict(from_attributes=True)


class LLMInstanceResponse(BaseModel):
    id: UUID
    name: str
    model_name: str
    model_type: str
    base_config: dict
    status: str
    maximum_tenants: int
    listed_llm_id: UUID
    created_at: datetime.datetime
    deleted_at: datetime.datetime | None = None

    # Relationships
    gpus: list[GPUBase] = []

    model_config = ConfigDict(from_attributes=True)
