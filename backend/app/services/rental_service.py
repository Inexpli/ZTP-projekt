from app.repositories.rental_repository import RentalRepository
from app.repositories.movie_repository import MovieRepository
from app.messaging.event_outbox import enqueue_event

rental_repo = RentalRepository()
movie_repo = MovieRepository()


def rent_movie(user_id, movie_id):
    """GĹ‚Ăłwna logika wypoĹĽyczenia filmu"""
    movie = movie_repo.get_by_id(movie_id)
    if not movie:
        raise ValueError("Film nie istnieje")

    if not rental_repo.is_movie_available(movie_id):
        raise ValueError("Film jest aktualnie wypoĹĽyczony")

    rental = rental_repo.create_rental(user_id, movie_id, rental_days=14)
    rental_data = rental.serialize()

    enqueue_event("rental.created", rental_data)

    return rental_data


def get_my_active_rentals(user_id):
    """Pobiera aktualne wypoĹĽyczenia i serializuje je z danymi filmĂłw"""
    rentals = rental_repo.get_user_active_rentals(user_id)
    return [rental.serialize() for rental in rentals]


def get_my_rental_history(user_id):
    """Pobiera historiÄ™ wypoĹĽyczeĹ„ i serializuje je z danymi filmĂłw"""
    rentals = rental_repo.get_user_rental_history(user_id)
    return [rental.serialize() for rental in rentals]


def return_movie(rental_id, user_id):
    """Zwrot filmu â€“ z zabezpieczeniem przed bĹ‚Ä™dami typĂłw ID"""
    rental = rental_repo.get_rental_by_id(rental_id)

    if not rental:
        raise ValueError("WypoĹĽyczenie nie istnieje")

    if int(rental.user_id) != int(user_id):
        raise ValueError("Nie masz uprawnieĹ„ do zwrotu tego filmu")

    if rental.return_date:
        raise ValueError("Film zostaĹ‚ juĹĽ zwrĂłcony")

    success = rental_repo.return_rental(rental_id)
    if success:
        enqueue_event("rental.returned", rental.serialize())

    return success


def is_movie_available(movie_id):
    """Sprawdza dostÄ™pnoĹ›Ä‡ filmu"""
    return rental_repo.is_movie_available(movie_id)
