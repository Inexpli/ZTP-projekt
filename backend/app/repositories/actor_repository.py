from app.extensions import db
from app.models.actor import Actor
from app.models.movie_actor import MovieActor
from sqlalchemy import or_


class ActorRepository:
    def __init__(self):
        self.session = db.session

    def get_all(self):
        return self.session.query(Actor).order_by(Actor.actor_name.asc()).all()

    def get_paginated(self, page=1, per_page=20, search=None):
        query = self.session.query(Actor)
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(Actor.actor_name.ilike(term))
        total = query.count()
        actors = (
            query.order_by(Actor.actor_name.asc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        total_pages = (total + per_page - 1) // per_page
        return {
            "actors": actors,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    def get_by_id(self, actor_id):
        return self.session.query(Actor).get(actor_id)

    def get_by_name(self, name):
        return self.session.query(Actor).filter_by(actor_name=name).first()

    def create(self, data):
        actor = Actor(
            actor_name=data["actor_name"],
            birth_date=data.get("birth_date"),
            birth_place=data.get("birth_place"),
            biography=data.get("biography"),
            photo_url=data.get("photo_url"),
            gender=data.get("gender"),
        )
        self.session.add(actor)
        self.session.commit()
        return actor

    def update(self, actor_id, data):
        actor = self.get_by_id(actor_id)
        if not actor:
            return None
        for field in ("actor_name", "birth_date", "birth_place", "biography", "photo_url", "gender"):
            if field in data:
                setattr(actor, field, data[field])
        self.session.commit()
        return actor

    def delete(self, actor_id):
        actor = self.get_by_id(actor_id)
        if actor:
            self.session.delete(actor)
            self.session.commit()
            return True
        return False

    # ─── Role ──────────────────────────────────────────────────────────────
    def add_to_movie(self, movie_id, actor_id, role=None):
        existing = self.session.query(MovieActor).filter_by(
            movie_id=movie_id, actor_id=actor_id
        ).first()
        if existing:
            existing.movie_role = role
            self.session.commit()
            return existing
        entry = MovieActor(movie_id=movie_id, actor_id=actor_id, movie_role=role)
        self.session.add(entry)
        self.session.commit()
        return entry

    def remove_from_movie(self, movie_id, actor_id):
        entry = self.session.query(MovieActor).filter_by(
            movie_id=movie_id, actor_id=actor_id
        ).first()
        if entry:
            self.session.delete(entry)
            self.session.commit()
            return True
        return False
