from app.repositories.movie_repository import MovieRepository
from app.repositories.genre_repository import GenreRepository
from app.models.movie_genre import MovieGenre
from app.models.rental import Rental
from app.extensions import db

movie_repo = MovieRepository()
genre_repo = GenreRepository()


def get_all_movies():
    return [m.serialize() for m in movie_repo.get_all()]


def get_movies_paginated(page=1, per_page=20, search=None, genre_id=None, user_id=None):
    result = movie_repo.get_paginated(page, per_page, search, genre_id)
    movies = result["movies"]

    active_rental_ids = set()
    if user_id:
        movie_ids_on_page = [m.movie_id for m in movies]
        rentals = Rental.query.filter(
            Rental.user_id == user_id,
            Rental.movie_id.in_(movie_ids_on_page),
            Rental.return_date == None,
        ).all()
        active_rental_ids = {r.movie_id for r in rentals}

    serialized_movies = []
    for m in movies:
        data = m.serialize()
        data["is_rented"] = m.movie_id in active_rental_ids
        serialized_movies.append(data)

    result["movies"] = serialized_movies
    return result


def get_movie_by_id(movie_id, user_id=None):
    """Zwraca peĹ‚ne dane z obsadÄ… oraz opcjonalnie informacjÄ™ o wypoĹĽyczeniu."""
    movie = movie_repo.get_by_id(movie_id)
    if not movie:
        return None

    data = movie.serialize(include_cast=True)

    if user_id:
        rental = Rental.query.filter_by(
            user_id=user_id, movie_id=movie_id, return_date=None
        ).first()
        data["is_rented"] = rental is not None
    else:
        data["is_rented"] = False

    return data


def create_movie(data):
    if not data or not data.get("title"):
        raise ValueError("TytuĹ‚ jest wymagany")
    movie = movie_repo.create(data)

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

    if "genre_ids" in data:
        db.session.query(MovieGenre).filter_by(movie_id=movie_id).delete()
        for gid in data["genre_ids"]:
            if genre_repo.get_by_id(gid):
                db.session.add(MovieGenre(movie_id=movie_id, genre_id=gid))
        db.session.commit()

    return updated.serialize(include_cast=True)


def delete_movie(movie_id):
    return movie_repo.delete(movie_id)
