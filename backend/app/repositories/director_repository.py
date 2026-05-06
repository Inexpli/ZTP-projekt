from app.extensions import db
from app.models.director import Director
from app.models.movie_director import MovieDirector


class DirectorRepository:
    def __init__(self):
        self.session = db.session

    def get_all(self):
        return self.session.query(Director).order_by(Director.director_name.asc()).all()

    def get_paginated(self, page=1, per_page=20, search=None):
        query = self.session.query(Director)
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(Director.director_name.ilike(term))
        total = query.count()
        directors = (
            query.order_by(Director.director_name.asc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        total_pages = (total + per_page - 1) // per_page
        return {
            "directors": directors,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    def get_by_id(self, director_id):
        return self.session.query(Director).get(director_id)

    def get_by_name(self, name):
        return self.session.query(Director).filter_by(director_name=name).first()

    def create(self, data):
        director = Director(
            director_name=data["director_name"],
            birth_date=data.get("birth_date"),
            birth_place=data.get("birth_place"),
            biography=data.get("biography"),
            photo_url=data.get("photo_url"),
            gender=data.get("gender"),
        )
        self.session.add(director)
        self.session.commit()
        return director

    def update(self, director_id, data):
        director = self.get_by_id(director_id)
        if not director:
            return None
        for field in ("director_name", "birth_date", "birth_place", "biography", "photo_url", "gender"):
            if field in data:
                setattr(director, field, data[field])
        self.session.commit()
        return director

    def delete(self, director_id):
        director = self.get_by_id(director_id)
        if director:
            self.session.delete(director)
            self.session.commit()
            return True
        return False

    def add_to_movie(self, movie_id, director_id):
        existing = self.session.query(MovieDirector).filter_by(
            movie_id=movie_id, director_id=director_id
        ).first()
        if existing:
            return existing
        entry = MovieDirector(movie_id=movie_id, director_id=director_id)
        self.session.add(entry)
        self.session.commit()
        return entry

    def remove_from_movie(self, movie_id, director_id):
        entry = self.session.query(MovieDirector).filter_by(
            movie_id=movie_id, director_id=director_id
        ).first()
        if entry:
            self.session.delete(entry)
            self.session.commit()
            return True
        return False
