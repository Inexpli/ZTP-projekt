from app.repositories.genre_repository import GenreRepository

genre_repo = GenreRepository()


def get_all_genres():
    return [g.serialize() for g in genre_repo.get_all()]


def get_genre_by_id(genre_id):
    genre = genre_repo.get_by_id(genre_id)
    return genre.serialize() if genre else None


def create_genre(data):
    return genre_repo.create(data).serialize()


def update_genre(genre_id, data):
    updated = genre_repo.update(genre_id, data)
    return updated.serialize() if updated else None


def delete_genre(genre_id):
    return genre_repo.delete(genre_id)
