import json
import logging
import os
import time
from datetime import datetime

import pika
import psycopg2
import psycopg2.extras


logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s [outbox-worker] %(message)s",
)
logger = logging.getLogger(__name__)
logging.getLogger("pika").setLevel(logging.WARNING)


def get_database_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ensure_outbox_table():
    with get_database_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
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
            cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS ix_outbox_events_status_created_at
                ON public.outbox_events (status, created_at)
                """
            )


def get_rabbitmq_connection():
    credentials = pika.PlainCredentials(
        os.environ.get("RABBITMQ_USER", "guest"),
        os.environ.get("RABBITMQ_PASSWORD", "guest"),
    )
    return pika.BlockingConnection(
        pika.ConnectionParameters(
            host=os.environ.get("RABBITMQ_HOST", "localhost"),
            port=int(os.environ.get("RABBITMQ_PORT", "5672")),
            credentials=credentials,
            heartbeat=30,
            blocked_connection_timeout=30,
        )
    )


def publish_event(channel, event):
    exchange = os.environ.get("RABBITMQ_EXCHANGE", "cinerent.events")
    payload = event["payload"]
    if isinstance(payload, str):
        payload = json.loads(payload)

    body = {
        "type": event["event_type"],
        "payload": payload,
        "metadata": {
            "source": event["source"],
            "event_id": event["event_id"],
            "created_at": event["created_at"].isoformat(),
            "published_at": f"{datetime.utcnow().isoformat()}Z",
        },
    }

    channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
    channel.basic_publish(
        exchange=exchange,
        routing_key=event["event_type"],
        body=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        properties=pika.BasicProperties(
            content_type="application/json",
            delivery_mode=2,
        ),
    )


def process_batch():
    batch_size = int(os.environ.get("OUTBOX_BATCH_SIZE", "20"))
    processed = 0

    with get_database_connection() as database_connection:
        with database_connection.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        ) as cursor:
            cursor.execute(
                """
                SELECT event_id, event_type, payload, source, created_at
                FROM public.outbox_events
                WHERE status = 'pending'
                ORDER BY created_at ASC
                LIMIT %s
                FOR UPDATE SKIP LOCKED
                """,
                (batch_size,),
            )
            events = cursor.fetchall()

            if not events:
                return 0

            rabbitmq_connection = get_rabbitmq_connection()
            channel = rabbitmq_connection.channel()

            try:
                for event in events:
                    try:
                        publish_event(channel, event)
                        cursor.execute(
                            """
                            UPDATE public.outbox_events
                            SET status = 'published',
                                published_at = CURRENT_TIMESTAMP,
                                attempts = attempts + 1,
                                last_error = NULL
                            WHERE event_id = %s
                            """,
                            (event["event_id"],),
                        )
                        processed += 1
                    except Exception as exc:
                        cursor.execute(
                            """
                            UPDATE public.outbox_events
                            SET attempts = attempts + 1,
                                last_error = %s
                            WHERE event_id = %s
                            """,
                            (str(exc), event["event_id"]),
                        )
                        logger.exception("Could not publish event %s", event["event_id"])
            finally:
                rabbitmq_connection.close()

    return processed


def main():
    ensure_outbox_table()
    interval = float(os.environ.get("OUTBOX_POLL_INTERVAL_SECONDS", "2"))
    logger.info("Outbox worker started")

    while True:
        try:
            processed = process_batch()
            if processed:
                logger.info("Published %s outbox event(s)", processed)
            time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("Stopping outbox worker")
            break
        except Exception:
            logger.exception("Outbox loop failed")
            time.sleep(5)


if __name__ == "__main__":
    main()
