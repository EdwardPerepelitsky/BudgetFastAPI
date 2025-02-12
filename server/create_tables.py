from queries import engine
from sqlmodel import SQLModel

SQLModel.metadata.create_all(engine)



