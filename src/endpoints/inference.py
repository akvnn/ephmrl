import uuid
import json
from uuid import UUID

import httpx
from fastapi import APIRouter, WebSocket, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from src.configuration import config
from src.crud.llm import LLMSubinstanceCRUD
from src.crud.plugin import OrganizationPluginCRUD
from src.dependency import get_db
from src.models.user import User
from src.schemas.inference import InferenceRequest
from src.utils import get_current_user_from_cookie
from src.websocket import manager
from src.constants import OLLAMA_MODEL_MAPPING

router = APIRouter(prefix="/inference", tags=["AI Inference"])


@router.websocket("/{llm_subinstance_id}/chat")
async def inference_websocket(
    websocket: WebSocket,
    llm_subinstance_id: str,
    organization_id: str,
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    connection_id = f"{organization_id}_{llm_subinstance_id}_{uuid.uuid4()}"
    await manager.connect(websocket, connection_id)

    try:
        org_id = UUID(organization_id)

        async for data in websocket.iter_text():
            data = await websocket.receive_json()

            try:
                request = InferenceRequest(**data)
            except Exception as e:
                logger.error(f"Invalid inference request: {str(e)}")
                await manager.send_json(
                    connection_id, {"type": "error", "message": "Invalid request."}
                )
                continue

            subinstance = await LLMSubinstanceCRUD.get_by_id(
                db, UUID(llm_subinstance_id), org_id
            )
            if not subinstance:
                await manager.send_json(
                    connection_id, {"type": "error", "message": "LLM model not found"}
                )
                continue

            llm_instance = subinstance.llm_instance
            if llm_instance.status != "active":
                await manager.send_json(
                    connection_id,
                    {"type": "error", "message": f"LLM is {llm_instance.status}"},
                )
                continue

            plugin_context = None
            if request.plugin_slug:
                installed = await OrganizationPluginCRUD.is_installed(
                    db, org_id, request.plugin_slug
                )
                if not installed:
                    await manager.send_json(
                        connection_id,
                        {
                            "type": "error",
                            "message": f"Plugin '{request.plugin_slug}' not installed",
                        },
                    )
                    continue

                plugin_endpoints = {"document-intelligence": "/search"}
                endpoint = plugin_endpoints.get(request.plugin_slug)
                if endpoint:
                    try:
                        plugin_url = (
                            f"{config.PLUGINS_BASE_URL}/{request.plugin_slug}{endpoint}"
                        )
                        payload = {
                            "organization_id": str(org_id),
                            "query": request.prompt,
                            "limit": 5,
                        }
                        if request.project_id:
                            payload["project_id"] = request.project_id

                        async with httpx.AsyncClient(timeout=30.0) as client:
                            resp = await client.post(plugin_url, json=payload)
                            if resp.status_code == 200:
                                plugin_context = resp.json()
                    except Exception as e:
                        logger.warning(f"Plugin context retrieval failed: {e}")

            final_prompt = request.prompt
            if plugin_context and request.plugin_slug == "document-intelligence":
                chunks = plugin_context.get("data", [])
                if chunks:
                    context_str = "\n\n".join(
                        [
                            f"Document: {chunk.get('title', 'Untitled')}\nContent: {chunk.get('text', '')}"
                            for chunk in chunks
                        ]
                    )
                    final_prompt = f"""Use the following documents to answer the question:

                        {context_str}

                        Question: {request.prompt}

                    Answer based on the documents provided:"""

            messages = []
            if request.system_prompt:
                messages.append({"role": "system", "content": request.system_prompt})
            messages.append({"role": "user", "content": final_prompt})

            llm_url = (
                llm_instance.base_config.get("endpoint_url", "http://localhost:11434")
                if llm_instance.base_config
                else "http://localhost:11434"
            )

            model_name = OLLAMA_MODEL_MAPPING.get(llm_instance.model_name)
            if not model_name:
                await manager.send_json(
                    connection_id,
                    {
                        "type": "error",
                        "message": f"Model '{llm_instance.model_name}' not supported for inference",
                    },
                )
                continue
            try:
                await _stream_ollama(
                    connection_id=connection_id,
                    ollama_url=llm_url,
                    model_name=model_name,
                    messages=messages,
                    max_tokens=request.max_tokens,
                    temperature=request.temperature,
                )
            except Exception as e:
                logger.error(f"Inference streaming error: {str(e)}")
                await manager.send_json(
                    connection_id, {"type": "error", "message": "Something went wrong."}
                )
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await manager.send_json(
                connection_id, {"type": "error", "message": "Something went wrong."}
            )
        except Exception as e:
            logger.error(f"Failed to send error message over WebSocket: {str(e)}")
    finally:
        manager.disconnect(connection_id)


async def _stream_ollama(
    connection_id: str,
    ollama_url: str,
    model_name: str,
    messages: list[dict],
    max_tokens: int,
    temperature: float,
):
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream(
                "POST",
                f"{ollama_url}/api/chat",
                json={
                    "model": model_name,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": temperature,
                    },
                },
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    await manager.send_json(
                        connection_id,
                        {
                            "type": "error",
                            "message": f"Ollama error: {error_text.decode()}",
                        },
                    )
                    return

                async for line in response.aiter_lines():
                    if not line.strip():
                        continue

                    try:
                        data = json.loads(line)
                        if "message" in data:
                            content = data["message"].get("content", "")
                            if content:
                                await manager.send_json(
                                    connection_id, {"type": "token", "content": content}
                                )

                        if data.get("done", False):
                            await manager.send_json(connection_id, {"type": "done"})
                            break
                    except json.JSONDecodeError:
                        continue

    except httpx.RequestError as e:
        logger.error(f"Ollama request error: {str(e)}")
        await manager.send_json(
            connection_id, {"type": "error", "message": "LLM service is unavailable."}
        )
    except Exception as e:
        logger.error(f"Ollama stream error: {str(e)}")
        await manager.send_json(
            connection_id, {"type": "error", "message": "Something went wrong."}
        )
