from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from sqlalchemy.ext.declarative import declarative_base

db = SQLAlchemy()

Base = db.Model

migrate = Migrate()
jwt = JWTManager()