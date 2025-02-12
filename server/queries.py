from sqlmodel import create_engine
from table_schema import User,Envelope,Transaction
from sqlmodel import Session
from typing import Annotated
from fastapi import Depends

mysql_url='mysql+pymysql://root:@localhost:3306/banking_app_fast_api'
engine = create_engine(mysql_url)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]