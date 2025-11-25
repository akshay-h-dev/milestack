# auth.py
import os
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

JWT_SECRET = os.environ.get("MILESTACK_JWT_SECRET", "change_this_secret_in_prod")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_HOURS = int(os.environ.get("MILESTACK_JWT_EXP_HOURS", 24))

def hash_password(plain: str) -> str:
    return generate_password_hash(plain)

def verify_password(hash_: str, plain: str) -> bool:
    return check_password_hash(hash_, plain)

def create_jwt(payload: dict) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(hours=JWT_EXP_DELTA_HOURS)
    payload_copy = payload.copy()
    payload_copy.update({"exp": exp})
    token = jwt.encode(payload_copy, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # PyJWT returns str for <=v2.0, bytes for older; ensure str
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

def decode_jwt(token: str):
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded
    except jwt.ExpiredSignatureError:
        return {"error": "token_expired"}
    except jwt.InvalidTokenError:
        return {"error": "invalid_token"}

def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or malformed"}), 401
        token = auth.split(" ", 1)[1].strip()
        decoded = decode_jwt(token)
        if isinstance(decoded, dict) and decoded.get("error"):
            return jsonify({"error": decoded["error"]}), 401
        # Attach user info into Flask global 'g' via current_app (we'll return it)
        # decoded should include 'user_id' and 'email' (see login/signup)
        request.user = decoded
        return fn(*args, **kwargs)
    return wrapper
