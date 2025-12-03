import json
import httpx
from loguru import logger
from src.websocket import manager


class InferenceCRUD:
    @staticmethod
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
                        error_message = (
                            error_text.decode() if error_text else "Unknown error"
                        )
                        logger.error(f"Ollama error response: {error_message}")
                        await manager.send_json(
                            connection_id,
                            {
                                "type": "error",
                                "message": "Something went wrong during inference.",
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
                                        connection_id,
                                        {"type": "token", "content": content},
                                    )

                            if data.get("done", False):
                                await manager.send_json(connection_id, {"type": "done"})
                                break
                        except json.JSONDecodeError:
                            continue

        except httpx.RequestError as e:
            logger.error(f"Ollama request error: {str(e)}")
            await manager.send_json(
                connection_id,
                {"type": "error", "message": "LLM service is unavailable."},
            )
        except Exception as e:
            logger.error(f"Ollama stream error: {str(e)}")
            await manager.send_json(
                connection_id, {"type": "error", "message": "Something went wrong."}
            )

    async def _stream_openrouter(
        connection_id: str,
        openrouter_url: str,
        model_name: str,
        messages: list[dict],
        max_tokens: int,
        temperature: float,
        api_key: str | None = None,
    ):
        headers = {
            "Content-Type": "application/json",
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream(
                    "POST",
                    f"{openrouter_url}/chat/completions",
                    headers=headers,
                    json={
                        "model": model_name,
                        "messages": messages,
                        "stream": True,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                    },
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        error_message = (
                            error_text.decode() if error_text else "Unknown error"
                        )
                        logger.error(f"OpenRouter error response: {error_message}")
                        await manager.send_json(
                            connection_id,
                            {
                                "type": "error",
                                "message": "Something went wrong during inference.",
                            },
                        )
                        return

                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue

                        if line.startswith("data: "):
                            line = line[len("data: ") :]

                        if line == "[DONE]":
                            await manager.send_json(connection_id, {"type": "done"})
                            break

                        try:
                            data = json.loads(line)
                            choices = data.get("choices", [])
                            for choice in choices:
                                delta = choice.get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    await manager.send_json(
                                        connection_id,
                                        {"type": "token", "content": content},
                                    )
                        except json.JSONDecodeError:
                            continue

        except httpx.RequestError as e:
            logger.error(f"OpenRouter request error: {str(e)}")
            await manager.send_json(
                connection_id,
                {"type": "error", "message": "LLM service is unavailable."},
            )
        except Exception as e:
            logger.error(f"OpenRouter stream error: {str(e)}")
            await manager.send_json(
                connection_id, {"type": "error", "message": "Something went wrong."}
            )
