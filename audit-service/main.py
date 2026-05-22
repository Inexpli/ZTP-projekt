import json
import logging
import os
import time

import pika
import psycopg2


logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s [audit-service] %(message)s",
)
logger = logging.getLogger(__name__)
logging.getLogger("pika").setLevel(logging.WARNING)


def get_database_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ensure_audit_table():
    with get_database_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS public.audit_events (
                    audit_id BIGSERIAL PRIMARY KEY,
                    event_type VARCHAR(120) NOT NULL,
                    source VARCHAR(120),
                    payload JSONB NOT NULL,
                    metadata JSONB,
                    received_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cursor.execute(
                """
                CREATE INDEX IF NOT EXISTS ix_audit_events_event_type_received_at
                ON public.audit_events (event_type, received_at)
                """
            )


def get_rabbitmq_parameters():
    credentials = pika.PlainCredentials(
        os.environ.get("RABBITMQ_USER", "guest"),
        os.environ.get("RABBITMQ_PASSWORD", "guest"),
    )
    return pika.ConnectionParameters(
        host=os.environ.get("RABBITMQ_HOST", "localhost"),
        port=int(os.environ.get("RABBITMQ_PORT", "5672")),
        credentials=credentials,
        heartbeat=30,
        blocked_connection_timeout=30,
    )


def save_audit_event(event):
    metadata = event.get("metadata") or {}
    payload = event.get("payload") or {}

    with get_database_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO public.audit_events (event_type, source, payload, metadata)
                VALUES (%s, %s, %s::jsonb, %s::jsonb)
                """,
                (
                    event.get("type", "unknown"),
                    metadata.get("source"),
                    json.dumps(payload, ensure_ascii=False),
                    json.dumps(metadata, ensure_ascii=False),
                ),
            )


def handle_message(channel, method, properties, body):
    try:
        event = json.loads(body.decode("utf-8"))
        save_audit_event(event)
        logger.info("Saved audit event %s", event.get("type"))
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError:
        logger.exception("Invalid JSON audit message was dropped")
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        logger.exception("Audit processing failed")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def start_consuming():
    exchange = os.environ.get("RABBITMQ_EXCHANGE", "cinerent.events")
    queue = os.environ.get("AUDIT_QUEUE", "audit-service")
    routing_key = os.environ.get("AUDIT_ROUTING_KEY", "#")

    ensure_audit_table()

    while True:
        try:
            connection = pika.BlockingConnection(get_rabbitmq_parameters())
            channel = connection.channel()
            channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
            channel.queue_declare(queue=queue, durable=True)
            channel.queue_bind(queue=queue, exchange=exchange, routing_key=routing_key)
            channel.basic_qos(prefetch_count=20)
            channel.basic_consume(queue=queue, on_message_callback=handle_message)

            logger.info(
                "Listening for audit events on exchange=%s queue=%s routing_key=%s",
                exchange,
                queue,
                routing_key,
            )
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as exc:
            logger.warning("RabbitMQ is not available yet: %s", exc)
            time.sleep(5)
        except KeyboardInterrupt:
            logger.info("Stopping audit-service")
            break


if __name__ == "__main__":
    start_consuming()
