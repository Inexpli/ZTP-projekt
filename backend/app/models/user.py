from app.extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Mapped, relationship  # Dodano importy dla typu relacji


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    is_staff = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ─── Relacje (DODANO) ────────────────────────────────────────────────
    # Musi pasować do back_populates="user" w modelu Rental
    rentals = db.relationship("Rental", back_populates="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "is_staff": self.is_staff,
            "is_active": self.is_active,
            "created_at": (
                self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else None
            ),
        }

    def __repr__(self):
        return f"<User {self.user_id}: {self.username}>"
