"""seed listed llm and llm instance data

Revision ID: 7a10bf6e5547
Revises: 2044729ed745
Create Date: 2025-11-17 16:54:35.067952

"""
from typing import Sequence, Union
from sqlalchemy.dialects.postgresql import UUID, JSONB
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a10bf6e5547'
down_revision: Union[str, Sequence[str], None] = '2044729ed745'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    listed_llm_table = sa.table('listed_llms',
        sa.column('id', UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('description', sa.String),
        sa.column('model_name', sa.String),
        sa.column('slug', sa.String),
        sa.column('image_location', sa.String),
        sa.column('base_config', JSONB),
        sa.column('status', sa.String),
    )
    
    llm_instance_table = sa.table('llm_instances',
        sa.column('id', UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('model_name', sa.String),
        sa.column('model_type', sa.String),
        sa.column('base_config', JSONB), 
        sa.column('status', sa.String),
        sa.column('maximum_tenants', sa.Integer),
        sa.column('listed_llm_id', UUID(as_uuid=True)),
    )

    # Generate UUIDs for listed LLMs
    llama4_id = uuid4()
    mistral_id = uuid4()

    # Seed ListedLLM data
    op.bulk_insert(listed_llm_table, [
        {
            'id': llama4_id,
            'name': 'Llama 4 8B',
            'description': 'Meta\'s Llama 4 8B model - efficient and powerful for general tasks',
            'model_name': 'meta-llama/Llama-4-8B-Instruct',
            'slug': 'llama-4-8b',
            'image_location': 'vllm/vllm-openai:latest',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.9,
                'max_tokens': 2048,
                'presence_penalty': 0.0,
                'frequency_penalty': 0.0
            },
            'status': 'live',
        },
        {
            'id': mistral_id,
            'name': 'Mistral 7B Instruct',
            'description': 'Mistral AI\'s 7B instruction-tuned model - fast and accurate',
            'model_name': 'mistralai/Mistral-7B-Instruct-v0.3',
            'slug': 'mistral-7b-instruct',
            'image_location': 'vllm/vllm-openai:latest',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95,
                'max_tokens': 4096,
                'presence_penalty': 0.0,
                'frequency_penalty': 0.0
            },
            'status': 'live',
        },
    ])

    # Seed LLMInstance data
    op.bulk_insert(llm_instance_table, [
        {
            'id': uuid4(),
            'name': 'Llama 4 8B - Primary Instance',
            'model_name': 'meta-llama/Llama-4-8B-Instruct',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.9,
                'max_tokens': 2048,
                'gpu_memory_utilization': 0.9,
                'tensor_parallel_size': 1
            },
            'status': 'active',
            'maximum_tenants': 10,
            'listed_llm_id': llama4_id,
        },
        {
            'id': uuid4(),
            'name': 'Mistral 7B - Primary Instance',
            'model_name': 'mistralai/Mistral-7B-Instruct-v0.3',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95,
                'max_tokens': 4096,
                'gpu_memory_utilization': 0.85,
                'tensor_parallel_size': 1
            },
            'status': 'active',
            'maximum_tenants': 15,
            'listed_llm_id': mistral_id,
        },
    ])


def downgrade() -> None:
    """Downgrade schema."""
    # Delete seeded data
    op.execute("DELETE FROM llm_instances WHERE model_name IN ('meta-llama/Llama-4-8B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3')")
    op.execute("DELETE FROM listed_llms WHERE slug IN ('llama-4-8b', 'mistral-7b-instruct')")