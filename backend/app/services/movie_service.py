from app.repositories.movie_repository import MovieRepository
from app.repositories.genre_repository import GenreRepository
from app.models.movie_genre import MovieGenre
from app.extensions import db

movie_repo = MovieRepository()
genre_repo = GenreRepository()


def get_all_movies():
    return [m.serialize() for m in movie_repo.get_all()]


def get_movies_paginated(page=1, per_page=20, search=None, genre_id=None):
    result = movie_repo.get_paginated(page, per_page, search, genre_id)
    result["movies"] = [m.serialize() for m in result["movies"]]
    return result


def get_movie_by_id(movie_id):
    """Zwraca pełne dane z obsadą (include_cast=True) dla strony szczegółów."""
    movie = movie_repo.get_by_id(movie_id)
    return movie.serialize(include_cast=True) if movie else None


def create_movie(data):
    if not data or not data.get("title"):
        raise ValueError("Tytuł jest wymagany")
    movie = movie_repo.create(data)

    # Opcjonalnie przypisz gatunki przy tworzeniu
    if "genre_ids" in data:
        for gid in data["genre_ids"]:
            if genre_repo.get_by_id(gid):
                db.session.add(MovieGenre(movie_id=movie.movie_id, genre_id=gid))
        db.session.commit()

    return movie.serialize(include_cast=True)


def update_movie(movie_id, data):
    updated = movie_repo.update(movie_id, data)
    if not updated:
        return None

    # Aktualizacja gatunków jeśli przekazano
    if "genre_ids" in data:
        db.session.query(MovieGenre).filter_by(movie_id=movie_id).delete()
        for gid in data["genre_ids"]:
            if genre_repo.get_by_id(gid):
                db.session.add(MovieGenre(movie_id=movie_id, genre_id=gid))
        db.session.commit()

    return updated.serialize(include_cast=True)


def delete_movie(movie_id):
    return movie_repo.delete(movie_id)
