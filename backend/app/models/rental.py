from app.extensions import db
from datetime import datetime, timedelta


class Rental(db.Model):
    __tablename__ = "rentals"

    rental_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey("movies.movie_id"), nullable=False)

    rental_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)  # kiedy powinien oddać
    return_date = db.Column(db.DateTime, nullable=True)  # kiedy faktycznie oddał

    # Relacje
    user = db.relationship("User", backref=db.backref("rentals", lazy=True))
    movie = db.relationship("Movie", backref=db.backref("rentals", lazy=True))

    def serialize(self):
        return {
            "rental_id": self.rental_id,
            "user_id": self.user_id,
            "movie_id": self.movie_id,
            "movie_title": self.movie.title if self.movie else None,
            "rental_date": (
                self.rental_date.strftime("%Y-%m-%d %H:%M")
                if self.rental_date
                else None
            ),
            "due_date": self.due_date.strftime("%Y-%m-%d") if self.due_date else None,
            "return_date": (
                self.return_date.strftime("%Y-%m-%d %H:%M")
                if self.return_date
                else None
            ),
            "is_returned": self.return_date is not None,
            "is_overdue": self.is_overdue(),
        }

    def is_overdue(self):
        if self.return_date:
            return False
        return datetime.utcnow() > self.due_date

    def __repr__(self):
        return f"<Rental {self.rental_id} - User {self.user_id}, Movie {self.movie_id}>"
