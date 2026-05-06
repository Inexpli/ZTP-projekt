import enum
from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Date, Text, Enum
from datetime import datetime

class Gender(enum.Enum):
    M = "M"
    K = "K"

class Actor(db.Model):
    __tablename__ = "actors"

    actor_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor_name: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    birth_date: Mapped[datetime] = mapped_column(Date, nullable=True)
    birth_place: Mapped[str] = mapped_column(String(255), nullable=True)
    biography: Mapped[str] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=True)
    movie_actors: Mapped[list["MovieActor"]] = relationship(
        "MovieActor", 
        back_populates="actor", 
        lazy="selectin",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Actor(id={self.actor_id}, name='{self.actor_name}')>"

    def _resolve_photo_url(self):
        if not self.photo_url:
            return None
        if self.photo_url.startswith(("http://", "https://")):
            return self.photo_url
        from flask import url_for
        return url_for("static", filename=f"actors/{self.photo_url}", _external=True)

    def serialize(self, include_movies=False):
        result = {
            "id": self.actor_id,
            "name": self.actor_name,
            "birth_date": self.birth_date.isoformat() if self.birth_date else None,
            "birth_place": self.birth_place,
            "biography": self.biography,
            "photo_url": self._resolve_photo_url(),
            "gender": self.gender.value if self.gender else None,
        }
        
        if include_movies:
            result["movies"] = [
                {
                    "id": ma.movie.movie_id, 
                    "title": ma.movie.title, 
                    "role": ma.movie_role
                } 
                for ma in self.movie_actors if ma.movie
            ]
        return result