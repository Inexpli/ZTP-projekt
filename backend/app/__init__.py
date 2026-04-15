# app/__init__.py
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.logger.setLevel(logging.DEBUG)

    # ==================== KONFIGURACJA ====================
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:ZAQ!2wsx@localhost:5432/ztp_projekt",
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "super-secret-key-zmien-to-w-produkcji-2026"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24 godziny

    # CORS
    CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})

    # ==================== INICJALIZACJA ROZSZERZEŃ ====================
    from app.extensions import db, migrate, jwt

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ==================== REJESTRACJA BLUEPRINTÓW ====================
    from app.routes.auth import auth_bp
    from app.routes.movies import movies_bp
    from app.routes.rentals import rentals_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(movies_bp, url_prefix="/api/movies")
    app.register_blueprint(rentals_bp, url_prefix="/api/rentals")

    # ==================== HANDLERY BŁĘDÓW JWT ====================
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Nieprawidłowy token", "message": str(error)}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return (
            jsonify({"error": "Token wygasł", "message": "Zaloguj się ponownie"}),
            401,
        )

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Brak tokenu"}), 401

    # ==================== GLOBALNE HANDLERY BŁĘDÓW ====================
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Nie znaleziono zasobu"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Błąd serwera"}), 500

    # ==================== KOMUNIKAT STARTOWY ====================
    print("✅ Aplikacja uruchomiona – dostępne endpointy:")
    print("   → /api/auth")
    print("   → /api/movies")
    print("   → /api/rentals")

    return app
