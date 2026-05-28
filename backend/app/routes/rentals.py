from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.rental_service import (
    rent_movie,
    get_my_active_rentals,
    get_my_rental_history,
    return_movie,
    is_movie_available,
)

rentals_bp = Blueprint("rentals", __name__)


@rentals_bp.route("/", methods=["POST"])
@jwt_required()
def create_rental():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or "movie_id" not in data:
            return jsonify({"error": "Brak movie_id"}), 400

        rental = rent_movie(user_id, data["movie_id"])
        return jsonify({"message": "Film wypoĹĽyczony pomyĹ›lnie", "rental": rental}), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "BĹ‚Ä…d podczas wypoĹĽyczania filmu"}), 500


@rentals_bp.route("/my", methods=["GET"])
@jwt_required()
def my_active_rentals():
    user_id = get_jwt_identity()
    rentals = get_my_active_rentals(user_id)
    return jsonify({"rentals": rentals}), 200


@rentals_bp.route("/history", methods=["GET"])
@jwt_required()
def my_rental_history():
    user_id = get_jwt_identity()
    rentals = get_my_rental_history(user_id)
    return jsonify({"rentals": rentals}), 200


@rentals_bp.route("/<int:rental_id>/return", methods=["POST"])
@jwt_required()
def return_rental(rental_id):
    try:
        user_id = get_jwt_identity()
        success = return_movie(rental_id, user_id)

        if success:
            return jsonify({"message": "Film zostaĹ‚ pomyĹ›lnie zwrĂłcony"}), 200
        else:
            return jsonify({"error": "Nie udaĹ‚o siÄ™ zwrĂłciÄ‡ filmu"}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "BĹ‚Ä…d podczas zwrotu filmu"}), 500


@rentals_bp.route("/check/<int:movie_id>", methods=["GET"])
def check_availability(movie_id):
    available = is_movie_available(movie_id)
    return jsonify({"movie_id": movie_id, "available": available}), 200
