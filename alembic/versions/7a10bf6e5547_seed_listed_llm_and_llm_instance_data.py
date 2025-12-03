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
        sa.column('provider_config', JSONB),
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
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '8B',
            },
            'status': 'live',
        },
        {
            'id': mistral_id,
            'name': 'Mistral Large 3 2512',
            'description': 'Mistral Large 3 2512 is Mistrals most capable model to date, featuring a sparse mixture-of-experts architecture with 41B active parameters (675B total), and released under the Apache 2.0 license.',
            'model_name': 'mistralai/mistral-large-2512',
            'slug': 'mistral-large-2512',
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '675B',
                'active_parameters': '41B'
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
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 10,
            'listed_llm_id': llama4_id,
        },
        {
            'id': uuid4(),
            'name': 'Mistral Large 3 2512 - Primary Instance',
            'model_name': 'mistralai/mistral-large-2512',
            'model_type': 'chat',
            'base_config': {
                'total_context': 262144,
                'max_output': 262144,
                'temperature': 0.7,
                'top_p': 0.95
            },
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 100,
            'listed_llm_id': mistral_id,
        },
    ])


def downgrade() -> None:
    """Downgrade schema."""
    # Delete seeded data
    op.execute("DELETE FROM llm_instances WHERE model_name IN ('meta-llama/Llama-4-8B-Instruct', 'mistralai/mistral-large-2512')")
    op.execute("DELETE FROM listed_llms WHERE slug IN ('llama-4-8b', 'mistral-large-2512')")