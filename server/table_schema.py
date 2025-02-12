from datetime import datetime
from sqlmodel import Field,UniqueConstraint,SQLModel

class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_name: str = Field(unique=True)
    password: str = Field()
    balance: float = Field(default=0)
    available_balance: float = Field(default=0)

class Envelope(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint( "user_id","category" ,name="idx_envelopes_uid_cat"),
    )
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id",ondelete="CASCADE")
    category: str = Field()
    budget: float = Field(default=0)
    spent: float = Field(default=0)

class Transaction(SQLModel, table=True):
    id: int = Field(primary_key=True)
    envelope_id: int = Field(foreign_key="envelope.id",ondelete="CASCADE",index=True)
    amount: float = Field(default=0)
    tr_date: datetime = Field(default_factory=lambda: datetime.now())
    description: str = Field(nullable=True,max_length=1000)





