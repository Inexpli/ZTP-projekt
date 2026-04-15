# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

# Główna instancja bazy danych
db = SQLAlchemy()

# Rozszerzenia
migrate = Migrate()
jwt = JWTManager()
