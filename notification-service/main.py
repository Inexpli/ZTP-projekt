import json
import logging
import os
import time

import pika


logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s [notification-service] %(message)s",
)
logger = logging.getLogger(__name__)
logging.getLogger("pika").setLevel(logging.WARNING)


def get_connection_parameters():
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


def build_notification_text(event):
    event_type = event.get("type")
    payload = event.get("payload", {})
    title = payload.get("movie_title") or f"Film #{payload.get('movie_id')}"
    user_id = payload.get("user_id")

    if event_type == "rental.created":
        return (
            f"Uzytkownik {user_id} wypozyczyl film '{title}'. "
            f"Termin zwrotu: {payload.get('due_date')}."
        )

    if event_type == "rental.returned":
        return f"Uzytkownik {user_id} zwrocil film '{title}'."

    return f"Odebrano zdarzenie {event_type}: {payload}"


def handle_message(channel, method, properties, body):
    try:
        event = json.loads(body.decode("utf-8"))
        logger.info(build_notification_text(event))
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError:
        logger.exception("Invalid JSON message was dropped")
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        logger.exception("Notification processing failed")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def start_consuming():
    exchange = os.environ.get("RABBITMQ_EXCHANGE", "cinerent.events")
    queue = os.environ.get("NOTIFICATION_QUEUE", "notification-service")
    routing_key = os.environ.get("NOTIFICATION_ROUTING_KEY", "rental.*")

    while True:
        try:
            connection = pika.BlockingConnection(get_connection_parameters())
            channel = connection.channel()
            channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
            channel.queue_declare(queue=queue, durable=True)
            channel.queue_bind(queue=queue, exchange=exchange, routing_key=routing_key)
            channel.basic_qos(prefetch_count=10)
            channel.basic_consume(queue=queue, on_message_callback=handle_message)

            logger.info(
                "Listening for events on exchange=%s queue=%s routing_key=%s",
                exchange,
                queue,
                routing_key,
            )
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as exc:
            logger.warning("RabbitMQ is not available yet: %s", exc)
            time.sleep(5)
        except KeyboardInterrupt:
            logger.info("Stopping notification-service")
            break


if __name__ == "__main__":
    start_consuming()
