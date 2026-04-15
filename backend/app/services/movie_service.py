from app.repositories.movie_repository import MovieRepository

movie_repo = MovieRepository()


def get_all_movies():
    movies = movie_repo.get_all()
    return [movie.serialize() for movie in movies]


def get_movies_paginated(page=1, per_page=20, search=None):
    result = movie_repo.get_paginated(page, per_page, search)
    result["movies"] = [movie.serialize() for movie in result["movies"]]
    return result


def get_movie_by_id(movie_id):
    movie = movie_repo.get_by_id(movie_id)
    return movie.serialize() if movie else None


def create_movie(data):
    # Prosta walidacja
    if not data or not data.get("title") or not data.get("release_date"):
        raise ValueError("Tytuł i data premiery są wymagane")

    return movie_repo.create(data).serialize()


def update_movie(movie_id, data):
    updated = movie_repo.update(movie_id, data)
    if not updated:
        return None
    return updated.serialize()


def delete_movie(movie_id):
    return movie_repo.delete(movie_id)
