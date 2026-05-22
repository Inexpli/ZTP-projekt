import json
import logging
import os
from datetime import datetime


logger = logging.getLogger(__name__)


def _json_default(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def publish_event(routing_key, payload):
    if os.environ.get("RABBITMQ_ENABLED", "true").lower() == "false":
        return

    try:
        import pika
    except ImportError:
        logger.warning("pika is not installed; event %s was not published", routing_key)
        return

    exchange = os.environ.get("RABBITMQ_EXCHANGE", "cinerent.events")
    host = os.environ.get("RABBITMQ_HOST", "localhost")
    port = int(os.environ.get("RABBITMQ_PORT", "5672"))
    username = os.environ.get("RABBITMQ_USER", "guest")
    password = os.environ.get("RABBITMQ_PASSWORD", "guest")

    event = {
        "type": routing_key,
        "payload": payload,
        "metadata": {
            "source": "backend",
            "published_at": f"{datetime.utcnow().isoformat()}Z",
        },
    }

    try:
        credentials = pika.PlainCredentials(username, password)
        parameters = pika.ConnectionParameters(
            host=host,
            port=port,
            credentials=credentials,
            heartbeat=30,
            blocked_connection_timeout=5,
            connection_attempts=2,
            retry_delay=1,
        )
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
        channel.basic_publish(
            exchange=exchange,
            routing_key=routing_key,
            body=json.dumps(event, default=_json_default).encode("utf-8"),
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,
            ),
        )
        connection.close()
    except Exception as exc:
        logger.warning("Could not publish event %s: %s", routing_key, exc)
