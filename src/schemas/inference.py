from pydantic import BaseModel, Field


class InferenceRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt/query")
    plugin_slug: str | None = Field(
        None,
        description="Optional plugin to use for context (e.g., 'document-intelligence')",
    )
    project_id: str | None = Field(None, description="Project ID for plugin context")
    system_prompt: str | None = Field(None, description="System prompt for the LLM")
    max_tokens: int = Field(
        2000, ge=1, le=32000, description="Maximum tokens to generate"
    )
    plugin_chunks_limit: int = Field(
        3, ge=1, le=10, description="Number of chunks to retrieve"
    )
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Sampling temperature")
