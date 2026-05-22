from app.repositories.user_repository import UserRepository
from flask_jwt_extended import create_access_token
from datetime import timedelta
from app.messaging.event_outbox import enqueue_event

user_repo = UserRepository()


def register_user(data):
    """Rejestracja nowego użytkownika"""
    if (
        not data
        or not data.get("username")
        or not data.get("email")
        or not data.get("password")
    ):
        raise ValueError("Brak wymaganych pól: username, email, password")

    if user_repo.get_by_username(data["username"]):
        raise ValueError("Nazwa użytkownika jest już zajęta")

    if user_repo.get_by_email(data["email"]):
        raise ValueError("Email jest już używany")

    user = user_repo.create_user(
        username=data["username"], email=data["email"], password=data["password"]
    )

    user_data = user.serialize()
    enqueue_event("auth.registered", user_data)

    return user_data


def login_user(username, password):
    """Logowanie użytkownika"""
    user = user_repo.get_by_username(username)

    if not user or not user.check_password(password):
        raise ValueError("Nieprawidłowa nazwa użytkownika lub hasło")

    if not user.is_active:
        raise ValueError("Konto zostało dezaktywowane")

    access_token = create_access_token(
        identity=str(user.user_id), expires_delta=timedelta(days=1)
    )

    user_data = user.serialize()
    enqueue_event("auth.logged_in", user_data)

    return {"access_token": access_token, "user": user_data}


def get_current_user(user_id):
    """Pobierz dane aktualnego użytkownika"""
    user = user_repo.get_by_id(user_id)
    if not user:
        return None
    return user.serialize()


def update_current_user(user_id, data):
    """Aktualizacja danych użytkownika"""
    updated_user = user_repo.update_user(user_id, data)
    if not updated_user:
        return None
    return updated_user.serialize()


def change_user_password(user_id, old_password, new_password):
    """Zmienia hasło użytkownika po weryfikacji starego"""
    user = user_repo.get_by_id(user_id)

    if not user:
        raise ValueError("Użytkownik nie istnieje")

    if not user.check_password(old_password):
        raise ValueError("Obecne hasło jest nieprawidłowe")

    if len(new_password) < 6:
        raise ValueError("Nowe hasło musi mieć co najmniej 6 znaków")

    return user_repo.update_password(user_id, new_password)
