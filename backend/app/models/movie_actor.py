from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, Integer, String


class MovieActor(db.Model):
    __tablename__ = "movie_actors"

    movie_id: Mapped[int] = mapped_column(
        ForeignKey("movies.movie_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    actor_id: Mapped[int] = mapped_column(
        ForeignKey("actors.actor_id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )
    movie_role: Mapped[str] = mapped_column(String(255), nullable=True)

    def __repr__(self):
        return f"<MovieActor(movie_id={self.movie_id}, actor_id={self.actor_id}, role='{self.movie_role}')>"

    def serialize(self):
        return {
            "movie_id": self.movie_id,
            "actor_id": self.actor_id,
            "role": self.movie_role,
        }
