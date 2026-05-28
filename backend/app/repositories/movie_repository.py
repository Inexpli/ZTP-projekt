from app.extensions import db
from app.models.movie import Movie
from app.models.genre import Genre
from sqlalchemy import or_


class MovieRepository:
    def __init__(self):
        self.session = db.session

    def get_all(self):
        return self.session.query(Movie).order_by(Movie.title.asc()).all()

    def get_paginated(self, page=1, per_page=20, search=None, genre_id=None):
        query = self.session.query(Movie)

        if search and search.strip():
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Movie.title.ilike(search_term), Movie.description.ilike(search_term)
                )
            )

        if genre_id:
            query = query.filter(Movie.genres.any(Genre.genre_id == genre_id))

        total = query.count()
        movies = (
            query.order_by(Movie.title.asc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        total_pages = (total + per_page - 1) // per_page

        return {
            "movies": movies,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    def get_by_id(self, movie_id):
        return self.session.query(Movie).get(movie_id)

    def create(self, data):
        movie = Movie(
            title=data["title"],
            description=data.get("description"),
            release_date=data["release_date"],
            duration_minutes=data.get("duration_minutes"),
            country=data.get("country"),
            poster_url=data.get("poster_url"),
            trailer_url=data.get("trailer_url"),
        )
        self.session.add(movie)
        self.session.commit()
        return movie

    def update(self, movie_id, data):
        movie = self.get_by_id(movie_id)
        if not movie:
            return None

        if "title" in data:
            movie.title = data["title"]
        if "description" in data:
            movie.description = data["description"]
        if "release_date" in data:
            movie.release_date = data["release_date"]
        if "duration_minutes" in data:
            movie.duration_minutes = data["duration_minutes"]
        if "country" in data:
            movie.country = data["country"]
        if "poster_url" in data:
            movie.poster_url = data["poster_url"]
        if "trailer_url" in data:
            movie.trailer_url = data["trailer_url"]

        self.session.commit()
        return movie

    def delete(self, movie_id):
        movie = self.get_by_id(movie_id)
        if movie:
            self.session.delete(movie)
            self.session.commit()
            return True
        return False
