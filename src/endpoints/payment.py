from fastapi import APIRouter, Request, HTTPException, Depends
from polar_sdk.webhooks import validate_event, WebhookVerificationError
from loguru import logger

from src.configuration import Settings
from src.dependency import get_settings

router = APIRouter(prefix="/webhook", tags=["webhooks"])


@router.post("/polar")
async def polar_webhook(request: Request, settings: Settings = Depends(get_settings)):
    try:
        payload = await request.body()
        event = validate_event(
            payload=payload,
            headers=request.headers,
            secret=settings.POLAR_WEBHOOK_SECRET,
        )

        # Handle different event types
        if event.type == "subscription.created":
            # await handle_subscription_created(event.data)
            logger.info("Received subscription.created event")
        elif event.type == "subscription.active":
            # await handle_subscription_active(event.data)
            logger.info("Received subscription.active event")
        elif event.type == "subscription.canceled":
            # await handle_subscription_canceled(event.data)
            logger.info("Received subscription.canceled event")
        elif event.type == "order.paid":
            # await handle_order_paid(event.data)
            logger.info("Received order.paid event")
        else:
            logger.warning(f"Unhandled event type: {event.type}")

        return {"status": "received"}

    except WebhookVerificationError:
        raise HTTPException(status_code=403, detail="Invalid signature")
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong")
