from app.repositories.rental_repository import RentalRepository
from app.repositories.movie_repository import MovieRepository

rental_repo = RentalRepository()
movie_repo = MovieRepository()


def rent_movie(user_id, movie_id):
    """Główna logika wypożyczenia filmu"""
    # Sprawdź czy film istnieje
    movie = movie_repo.get_by_id(movie_id)
    if not movie:
        raise ValueError("Film nie istnieje")

    # Sprawdź czy film jest dostępny
    if not rental_repo.is_movie_available(movie_id):
        raise ValueError("Film jest aktualnie wypożyczony")

    # Utwórz wypożyczenie
    rental = rental_repo.create_rental(user_id, movie_id, rental_days=14)

    return rental.serialize()


def get_my_active_rentals(user_id):
    """Pobiera aktualne wypożyczenia i serializuje je z danymi filmów"""
    rentals = rental_repo.get_user_active_rentals(user_id)
    return [rental.serialize() for rental in rentals]


def get_my_rental_history(user_id):
    """Pobiera historię wypożyczeń i serializuje je z danymi filmów"""
    rentals = rental_repo.get_user_rental_history(user_id)
    return [rental.serialize() for rental in rentals]


def return_movie(rental_id, user_id):
    """Zwrot filmu – z zabezpieczeniem przed błędami typów ID"""
    rental = rental_repo.get_rental_by_id(rental_id)

    if not rental:
        raise ValueError("Wypożyczenie nie istnieje")

    # Używamy int(), bo ID z tokena JWT często przychodzi jako string
    if int(rental.user_id) != int(user_id):
        raise ValueError("Nie masz uprawnień do zwrotu tego filmu")

    if rental.return_date:
        raise ValueError("Film został już zwrócony")

    success = rental_repo.return_rental(rental_id)
    return success


def is_movie_available(movie_id):
    """Sprawdza dostępność filmu"""
    return rental_repo.is_movie_available(movie_id)
