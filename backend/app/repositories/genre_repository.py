from app.extensions import db
from app.models.genre import Genre


class GenreRepository:
    def __init__(self):
        self.session = db.session

    def get_all(self):
        return self.session.query(Genre).order_by(Genre.genre_name.asc()).all()

    def get_by_id(self, genre_id):
        return self.session.query(Genre).get(genre_id)

    def get_by_name(self, name):
        return self.session.query(Genre).filter_by(genre_name=name).first()

    def create(self, data):
        if not data.get("genre_name"):
            raise ValueError("Nazwa gatunku jest wymagana")
        if self.get_by_name(data["genre_name"]):
            raise ValueError(f"Gatunek '{data['genre_name']}' już istnieje")
        genre = Genre(genre_name=data["genre_name"])
        self.session.add(genre)
        self.session.commit()
        return genre

    def update(self, genre_id, data):
        genre = self.get_by_id(genre_id)
        if not genre:
            return None
        if "genre_name" in data:
            genre.genre_name = data["genre_name"]
        self.session.commit()
        return genre

    def delete(self, genre_id):
        genre = self.get_by_id(genre_id)
        if genre:
            self.session.delete(genre)
            self.session.commit()
            return True
        return False
