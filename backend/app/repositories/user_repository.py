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

    def create_user(self, username, email, password, first_name=None, last_name=None):
        user = User(
            username=username, email=email, first_name=first_name, last_name=last_name
        )
        user.set_password(password)

        self.session.add(user)
        self.session.commit()
        return user

    def update_user(self, user_id, data):
        user = self.get_by_id(user_id)
        if not user:
            return None

        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "email" in data:
            user.email = data["email"]

        self.session.commit()
        return user
