from app.repositories.director_repository import DirectorRepository
from app.repositories.movie_repository import MovieRepository

director_repo = DirectorRepository()
movie_repo = MovieRepository()


def get_directors_paginated(page=1, per_page=20, search=None):
    result = director_repo.get_paginated(page, per_page, search)
    result["directors"] = [d.serialize() for d in result["directors"]]
    return result


def get_director_by_id(director_id, include_movies=False):
    director = director_repo.get_by_id(director_id)
    if not director:
        return None
    return director.serialize(include_movies=include_movies)


def create_director(data):
    if not data or not data.get("director_name"):
        raise ValueError("Imię i nazwisko reżysera jest wymagane")
    if director_repo.get_by_name(data["director_name"]):
        raise ValueError(f"Reżyser '{data['director_name']}' już istnieje")
    return director_repo.create(data).serialize()


def update_director(director_id, data):
    updated = director_repo.update(director_id, data)
    return updated.serialize() if updated else None


def delete_director(director_id):
    return director_repo.delete(director_id)


def add_director_to_movie(movie_id, director_id):
    if not movie_repo.get_by_id(movie_id):
        raise ValueError("Film nie istnieje")
    if not director_repo.get_by_id(director_id):
        raise ValueError("Reżyser nie istnieje")
    entry = director_repo.add_to_movie(movie_id, director_id)
    return entry.serialize()


def remove_director_from_movie(movie_id, director_id):
    if not director_repo.remove_from_movie(movie_id, director_id):
        raise ValueError("Powiązanie reżysera z filmem nie istnieje")
    return True
