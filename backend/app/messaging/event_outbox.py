import json
import logging
from datetime import datetime

from sqlalchemy import text

from app.extensions import db


logger = logging.getLogger(__name__)


def _json_default(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def ensure_outbox_table():
    db.session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS public.outbox_events (
                event_id BIGSERIAL PRIMARY KEY,
                event_type VARCHAR(120) NOT NULL,
                payload JSONB NOT NULL,
                source VARCHAR(120) NOT NULL DEFAULT 'backend',
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                attempts INTEGER NOT NULL DEFAULT 0,
                last_error TEXT,
                created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP WITHOUT TIME ZONE
            )
            """
        )
    )
    db.session.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS ix_outbox_events_status_created_at
            ON public.outbox_events (status, created_at)
            """
        )
    )
    db.session.commit()


def enqueue_event(event_type, payload, source="backend"):
    try:
        serialized_payload = json.loads(json.dumps(payload, default=_json_default))
        db.session.execute(
            text(
                """
                INSERT INTO public.outbox_events (event_type, payload, source, created_at)
                VALUES (:event_type, CAST(:payload AS jsonb), :source, :created_at)
                """
            ),
            {
                "event_type": event_type,
                "payload": json.dumps(serialized_payload, ensure_ascii=False),
                "source": source,
                "created_at": datetime.utcnow(),
            },
        )
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        logger.warning("Could not enqueue event %s: %s", event_type, exc)
