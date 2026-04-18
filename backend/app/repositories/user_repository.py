from app.extensions import db
from app.models.user import User


class UserRepository:
    def __init__(self):
        self.session = db.session

    def get_by_id(self, user_id):
        return self.session.query(User).get(user_id)

    def get_by_username(self, username):
        return self.session.query(User).filter_by(username=username).first()

    def get_by_email(self, email):
        return self.session.query(User).filter_by(email=email).first()

    # USUNIĘTO: first_name i last_name z argumentów i konstruktora
    def create_user(self, username, email, password):
        user = User(username=username, email=email)
        user.set_password(password)

        self.session.add(user)
        self.session.commit()
        return user

    def update_user(self, user_id, data):
        user = self.get_by_id(user_id)
        if not user:
            return None

        # USUNIĘTO: aktualizację first_name i last_name
        if "email" in data:
            user.email = data["email"]
        if "username" in data:
            user.username = data["username"]

        self.session.commit()
        return user
