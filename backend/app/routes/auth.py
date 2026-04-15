from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import (
    register_user,
    login_user,
    get_current_user,
    update_current_user,
)

auth_bp = Blueprint("auth", __name__)


# Rejestracja
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        user_data = register_user(data)
        return (
            jsonify(
                {"message": "Konto zostało utworzone pomyślnie", "user": user_data}
            ),
            201,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Błąd podczas rejestracji"}), 500


# Logowanie
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Brak nazwy użytkownika lub hasła"}), 400

        result = login_user(data["username"], data["password"])
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "Błąd podczas logowania"}), 500


# Dane aktualnego użytkownika
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = get_current_user(user_id)
    if not user:
        return jsonify({"error": "Użytkownik nie znaleziony"}), 404
    return jsonify(user), 200


# Aktualizacja danych użytkownika
@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        updated_user = update_current_user(user_id, data)

        if not updated_user:
            return jsonify({"error": "Użytkownik nie znaleziony"}), 404

        return (
            jsonify({"message": "Dane zaktualizowane pomyślnie", "user": updated_user}),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Błąd podczas aktualizacji danych"}), 500
