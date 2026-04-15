# app/models/__init__.py

# Importujemy db z extensions
from app.extensions import db

# Importujemy tylko modele, których aktualnie używamy
from .user import User
from .movie import Movie
from .rental import Rental

# Lista publicznie dostępnych obiektów
__all__ = ["db", "User", "Movie", "Rental"]
