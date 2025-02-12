from datetime import datetime, timedelta,timezone
from table_schema import User
import games_queries as gq
from queries import SessionDep
import jwt
from jwt.exceptions import InvalidTokenError
from flask_bcrypt import Bcrypt
from pydantic import BaseModel

SECRET_KEY = "dc13464c8de4f97d4bad6414cc8b07867706ec87e5f70afdf371500dd98773bd"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
bcrypt=Bcrypt()

class Token(BaseModel):
    access_token: str
    token_type: str

def authenticate_user(userName: str, password: str,
session:SessionDep)->User:
    user = gq.getAccountInfoUName(userName,session)
    if len(user)==0:
        raise Exception('User not found')
    user=user[0]
    if not bcrypt.check_password_hash(user.password,password):
        raise Exception('Wrong password')
    return user

def create_access_token(data: dict)->Token:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: Token)->dict:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload