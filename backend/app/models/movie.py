from app.extensions import db
from datetime import datetime

class Movie(db.Model):
    __tablename__ = "movies"

    movie_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    release_date = db.Column(db.Date, nullable=False)
    duration_minutes = db.Column(db.Integer)
    country = db.Column(db.String(100))
    original_language = db.Column(db.String(50))
    poster_url = db.Column(db.String(500))
    trailer_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "movie_id": self.movie_id,
            "title": self.title,
            "description": self.description,
            "release_date": (
                self.release_date.strftime("%Y-%m-%d") if self.release_date else None
            ),
            "duration_minutes": self.duration_minutes,
            "country": self.country,
            "original_language": self.original_language,
            "poster_url": self.poster_url,
            "trailer_url": self.trailer_url,
            "created_at": (
                self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else None
            ),
        }

    def repr(self):
        return f"<Movie {self.movie_id}: {self.title}>"