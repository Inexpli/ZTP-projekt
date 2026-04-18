from app.repositories.user_repository import UserRepository
from flask_jwt_extended import create_access_token
from datetime import timedelta

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

    # Sprawdź czy użytkownik już istnieje
    if user_repo.get_by_username(data["username"]):
        raise ValueError("Nazwa użytkownika jest już zajęta")

    if user_repo.get_by_email(data["email"]):
        raise ValueError("Email jest już używany")

    # Przekazujemy tylko to, co model User jest w stanie przyjąć
    user = user_repo.create_user(
        username=data["username"], email=data["email"], password=data["password"]
    )

    return user.serialize()


def login_user(username, password):
    """Logowanie użytkownika"""
    user = user_repo.get_by_username(username)

    if not user or not user.check_password(password):
        raise ValueError("Nieprawidłowa nazwa użytkownika lub hasło")

    if not user.is_active:
        raise ValueError("Konto zostało dezaktywowane")

    # Tworzenie JWT tokenu
    access_token = create_access_token(
        identity=str(user.user_id), expires_delta=timedelta(days=1)
    )

    return {"access_token": access_token, "user": user.serialize()}


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
