from app.repositories.actor_repository import ActorRepository
from app.repositories.movie_repository import MovieRepository

actor_repo = ActorRepository()
movie_repo = MovieRepository()


def get_actors_paginated(page=1, per_page=20, search=None):
    result = actor_repo.get_paginated(page, per_page, search)
    result["actors"] = [a.serialize() for a in result["actors"]]
    return result


def get_actor_by_id(actor_id, include_movies=False):
    actor = actor_repo.get_by_id(actor_id)
    if not actor:
        return None
    return actor.serialize(include_movies=include_movies)


def create_actor(data):
    if not data or not data.get("actor_name"):
        raise ValueError("Imię i nazwisko aktora jest wymagane")
    if actor_repo.get_by_name(data["actor_name"]):
        raise ValueError(f"Aktor '{data['actor_name']}' już istnieje")
    return actor_repo.create(data).serialize()


def update_actor(actor_id, data):
    updated = actor_repo.update(actor_id, data)
    return updated.serialize() if updated else None


def delete_actor(actor_id):
    return actor_repo.delete(actor_id)


def add_actor_to_movie(movie_id, actor_id, role=None):
    """Przypisz aktora do filmu z opcjonalną rolą."""
    if not movie_repo.get_by_id(movie_id):
        raise ValueError("Film nie istnieje")
    if not actor_repo.get_by_id(actor_id):
        raise ValueError("Aktor nie istnieje")
    entry = actor_repo.add_to_movie(movie_id, actor_id, role)
    return entry.serialize()


def remove_actor_from_movie(movie_id, actor_id):
    if not actor_repo.remove_from_movie(movie_id, actor_id):
        raise ValueError("Powiązanie aktora z filmem nie istnieje")
    return True
