from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    String,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Float,
    Boolean,
    Enum,
    Text,
)
from sqlalchemy.orm import validates
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from models.extensions import Base, db


class CustomBase(Base):
    __abstract__ = True