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
    model_ids = {
        'Mistral Large 3 2512': uuid4(),
        'DeepSeek V3.2': uuid4(),
        'GPT-OSS 120B': uuid4(),
        'GPT-OSS 20B': uuid4(),
        'Meta: Llama 3 8B Instruct': uuid4(),
        'MoonshotAI: Kimi K2 Thinking': uuid4(),
    }
    # Seed ListedLLM data
    op.bulk_insert(listed_llm_table, [
        {
            'id': model_ids['Mistral Large 3 2512'],
            'name': 'Mistral Large 3 2512',
            'description': 'Mistral Large 3 2512 is Mistrals most capable model to date, featuring a sparse mixture-of-experts architecture with 675B total parameters (675B total).',
            'model_name': 'mistralai/mistral-large-2512',
            'slug': 'mistral-large-2512',
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '675B',
                'active_parameters': '41B'
            },
            'status': 'live',
        },
        {
            'id': model_ids['DeepSeek V3.2'],
            'name': 'DeepSeek V3.2',
            'description': 'DeepSeek V3.2 is an advanced language model with improved reasoning and coding capabilities.',
            'model_name': 'deepseek/deepseek-v3.2',
            'slug': 'deepseek-v3-2',
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '685B'
            },
            'status': 'live',
        },
        {
            'id': model_ids['GPT-OSS 120B'],
            'name': 'GPT-OSS 120B',
            'description': 'GPT-OSS 120B is a large open-source language model developed by OpenAI optimized for general-purpose tasks.',
            'model_name': 'openai/gpt-oss-120b',
            'slug': 'gpt-oss-120b',
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '120B'
            },
            'status': 'live',
        },
        {
            'id': model_ids['GPT-OSS 20B'],
            'name': 'GPT-OSS 20B',
            'description': 'GPT-OSS 20B is a lightweight open-source language model developed by OpenAI suitable for resource-constrained environments.',
            'model_name': 'openai/gpt-oss-20b',
            'slug': 'gpt-oss-20b',
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '20B'
            },
            'status': 'live',
        },
        {
            'id': model_ids['Meta: Llama 3 8B Instruct'],
            'name': 'Meta: Llama 3 8B Instruct',
            'description': 'Meta: Llama 3 8B Instruct is a powerful language model designed for instruction-following tasks.',
            'model_name': 'meta-llama/llama-3-8b-instruct',
            'slug': 'llama-3-8b-instruct',
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '8B'
            },
            'status': 'live',
        },
        {
            'id': model_ids['MoonshotAI: Kimi K2 Thinking'],
            'name': 'MoonshotAI: Kimi K2 Thinking',
            'description': 'MoonshotAI: Kimi K2 Thinking is an innovative model designed for advanced reasoning and decision-making tasks.',
            'model_name': 'moonshotai/kimi-k2-thinking',
            'slug': 'kimi-k2-thinking',
            'image_location': 'unavailable',
            'base_config': {
                'parameters': '1000B',
                'active_parameters': '41B'
            },
            'status': 'live',
        }
    ])

    # Seed LLMInstance data
    op.bulk_insert(llm_instance_table, [
        {
            'id': uuid4(),
            'name': 'Mistral Large 3 2512 - Primary Instance',
            'model_name': 'mistralai/mistral-large-2512',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95
            },
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 100,
            'listed_llm_id': model_ids['Mistral Large 3 2512'],
        },
        {
            'id': uuid4(),
            'name': 'DeepSeek V3.2 - Primary Instance',
            'model_name': 'deepseek/deepseek-v3.2',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95
            },
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 100,
            'listed_llm_id': model_ids['DeepSeek V3.2'],
        },
        {
            'id': uuid4(),
            'name': 'GPT-OSS 120B - Primary Instance',
            'model_name': 'openai/gpt-oss-120b',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95
            },
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 100,
            'listed_llm_id': model_ids['GPT-OSS 120B'],
        },
        {
            'id': uuid4(),
            'name': 'GPT-OSS 20B - Primary Instance',
            'model_name': 'openai/gpt-oss-20b',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95
            },
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 100,
            'listed_llm_id': model_ids['GPT-OSS 20B'],
        },
        {
            'id': uuid4(),
            'name': 'Meta: Llama 3 8B Instruct - Primary Instance',
            'model_name': 'meta-llama/llama-3-8b-instruct',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95
            },
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 100,
            'listed_llm_id': model_ids['Meta: Llama 3 8B Instruct'],
        },
        {
            'id': uuid4(),
            'name': 'MoonshotAI: Kimi K2 Thinking - Primary Instance',
            'model_name': 'moonshotai/kimi-k2-thinking',
            'model_type': 'chat',
            'base_config': {
                'temperature': 0.7,
                'top_p': 0.95
            },
            'provider_config':{
                'provider': 'openrouter',
                'endpoint_url': 'https://openrouter.ai/api/v1'
            },
            'status': 'active',
            'maximum_tenants': 100,
            'listed_llm_id': model_ids['MoonshotAI: Kimi K2 Thinking'],
        },
    ])


def downgrade() -> None:
    """Downgrade schema."""
    # Delete seeded data
    op.execute("DELETE FROM llm_instances WHERE model_name IN ('Mistral Large 3 2512 - Primary Instance', 'DeepSeek V3.2 - Primary Instance', 'GPT-OSS 120B - Primary Instance', 'GPT-OSS 20B - Primary Instance', 'Meta: Llama 3 8B Instruct - Primary Instance', 'MoonshotAI: Kimi K2 Thinking - Primary Instance')")
    op.execute("DELETE FROM listed_llms WHERE slug IN ('mistral-large-2512', 'deepseek-v3-2', 'gpt-oss-120b', 'gpt-oss-20b', 'llama-3-8b-instruct', 'kimi-k2-thinking')")