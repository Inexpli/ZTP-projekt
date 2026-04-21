# app/__init__.py
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

load_dotenv()


def create_app():
    app = Flask(__name__)

    # ==================== LOGOWANIE ====================
    # Zmieniamy na INFO, żeby DEBUG nie zalewał konsoli przy każdym zapytaniu
    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)

    # ==================== KONFIGURACJA ====================
    db_password = os.environ.get("PASSWORD", "ZAQ!2wsx")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql+psycopg2://postgres:{db_password}@localhost:5432/ztp_projekt?client_encoding=utf8"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "super-secret-key-zmien-to-w-produkcji-2026"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24h

    # ==================== CORS (POPRAWIONE) ====================
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
                "supports_credentials": True,
                "allow_headers": ["Content-Type", "Authorization"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                # max_age: 3600 sekund (1h). Przeglądarka zapamięta pozwolenie OPTIONS
                # i nie będzie wysyłać go przed każdym pojedynczym pobraniem filmu.
                "max_age": 3600,
            }
        },
    )

    # ==================== INICJALIZACJA ROZSZERZEŃ ====================
    from app.extensions import db, migrate, jwt

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ==================== MODELE I BAZA ====================
    with app.app_context():
        from app.models.user import User
        from app.models.genre import Genre
        from app.models.actor import Actor
        from app.models.director import Director
        from app.models.movie import Movie
        from app.models.rental import Rental
        from app.models.movie_actor import MovieActor
        from app.models.movie_director import MovieDirector
        from app.models.movie_genre import MovieGenre

        db.create_all()
        app.logger.info("🛠️  Struktura bazy danych została zweryfikowana/stworzona.")

    # ==================== BLUEPRINTY ====================
    from app.routes.auth import auth_bp
    from app.routes.movies import movies_bp
    from app.routes.rentals import rentals_bp
    from app.routes.genres import genres_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(movies_bp, url_prefix="/api/movies")
    app.register_blueprint(rentals_bp, url_prefix="/api/rentals")
    app.register_blueprint(genres_bp, url_prefix="/api/genres")

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
        return jsonify({"error": "Brak tokenu", "message": "Wymagana autoryzacja"}), 401

    # ==================== GLOBALNE HANDLERY BŁĘDÓW ====================
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Nie znaleziono zasobu (404)"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Błąd wewnętrzny serwera (500)"}), 500

    # ==================== LOGI STARTOWE ====================
    app.logger.info("✅ Aplikacja uruchomiona – API gotowe.")

    return app
