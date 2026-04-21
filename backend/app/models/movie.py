from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Date, Text, DateTime
from datetime import datetime


class Movie(db.Model):
    __tablename__ = "movies"

    movie_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    release_date = db.Column(db.Date, nullable=False)
    duration_minutes = db.Column(db.Integer)
    country = db.Column(db.String(100))
    original_language = db.Column(db.String(50))  # Tego brakowało
    poster_url = db.Column(db.String(500))
    trailer_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ─── Relacje ──────────────────────────────────────────────────────────
    actors: Mapped[list["Actor"]] = relationship(
        "Actor", secondary="movie_actors", back_populates="movies", lazy="selectin"
    )
    directors: Mapped[list["Director"]] = relationship(
        "Director",
        secondary="movie_directors",
        back_populates="movies",
        lazy="selectin",
    )
    genres: Mapped[list["Genre"]] = relationship(
        "Genre", secondary="movies_genres", back_populates="movies", lazy="selectin"
    )
    rentals: Mapped[list["Rental"]] = relationship(
        "Rental", back_populates="movie", lazy="dynamic"
    )

    def __repr__(self):
        return f"<Movie(id={self.movie_id}, title='{self.title}')>"

    def serialize(self, include_cast=False):
        # Podstawowy słownik z wszystkimi brakującymi polami płaskimi
        data = {
            "movie_id": self.movie_id,
            "title": self.title,
            "description": self.description,
            "release_date": (
                self.release_date.isoformat() if self.release_date else None
            ),
            "duration_minutes": self.duration_minutes,
            "country": self.country,
            "original_language": self.original_language,  # Dodano
            "poster_url": self.poster_url,
            "trailer_url": self.trailer_url,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),  # Dodano
            "genres": [g.serialize() for g in self.genres],
            "directors": [d.serialize() for d in self.directors],
        }

        if include_cast:
            # Optymalizacja: pobieramy role wszystkich aktorów dla tego filmu jednym zapytaniem
            from app.models.movie_actor import MovieActor

            roles_map = {
                ra.actor_id: ra.movie_role
                for ra in db.session.query(MovieActor)
                .filter_by(movie_id=self.movie_id)
                .all()
            }

            cast = []
            for actor in self.actors:
                actor_data = actor.serialize()
                actor_data["role"] = roles_map.get(actor.actor_id)
                cast.append(actor_data)
            data["actors"] = cast
        else:
            # Upewnij się, że pole w modelu Actor to na pewno 'actor_name' (zgodnie z Twoim kodem)
            data["actors"] = [
                {"id": a.actor_id, "name": getattr(a, "actor_name", "Unknown")}
                for a in self.actors
            ]

        return data
