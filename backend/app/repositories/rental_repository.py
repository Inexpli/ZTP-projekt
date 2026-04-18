from app.extensions import db
from app.models.rental import Rental
from datetime import datetime, timedelta
from sqlalchemy import and_
from sqlalchemy.orm import joinedload


class RentalRepository:
    def __init__(self):
        self.session = db.session

    def create_rental(self, user_id, movie_id, rental_days=14):
        """Tworzy nowe wypożyczenie"""
        due_date = datetime.utcnow() + timedelta(days=rental_days)

        rental = Rental(user_id=user_id, movie_id=movie_id, due_date=due_date)
        self.session.add(rental)
        self.session.commit()
        return rental

    def get_user_active_rentals(self, user_id):
        """Zwraca aktualne (nieoddane) wypożyczenia użytkownika wraz z danymi filmów"""
        return (
            self.session.query(Rental)
            .options(joinedload(Rental.movie))  # Dociąga dane filmu (title, poster_url)
            .filter(Rental.user_id == user_id, Rental.return_date == None)
            .order_by(Rental.due_date.asc())
            .all()
        )

    def get_user_rental_history(self, user_id):
        """Zwraca całą historię wypożyczeń użytkownika wraz z danymi filmów"""
        return (
            self.session.query(Rental)
            .options(joinedload(Rental.movie))  # Dociąga dane filmu (title, poster_url)
            .filter(Rental.user_id == user_id)
            .order_by(Rental.rental_date.desc())
            .all()
        )

    def get_rental_by_id(self, rental_id):
        """Pobiera konkretne wypożyczenie po ID"""
        return self.session.query(Rental).get(rental_id)

    def return_rental(self, rental_id):
        """Zaznacza film jako zwrócony"""
        rental = self.get_rental_by_id(rental_id)
        if rental and not rental.return_date:
            rental.return_date = datetime.utcnow()
            self.session.commit()
            return True
        return False

    def is_movie_available(self, movie_id):
        """Sprawdza czy film jest dostępny do wypożyczenia"""
        active_rental = (
            self.session.query(Rental)
            .filter(Rental.movie_id == movie_id, Rental.return_date == None)
            .first()
        )
        return active_rental is None

    def get_overdue_rentals(self):
        """Zwraca wszystkie przeterminowane wypożyczenia"""
        now = datetime.utcnow()
        return (
            self.session.query(Rental)
            .filter(Rental.return_date == None, Rental.due_date < now)
            .all()
        )
