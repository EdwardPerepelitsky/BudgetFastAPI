from table_schema import User,Envelope,Transaction
from sqlmodel import select
from sqlalchemy.sql import func
from datetime import datetime
from queries import SessionDep

def createAccount(userName:str,password:str,session:SessionDep)-> None:
    user = User(user_name=userName,password=password)
    session.add(user)
    session.flush()
    user_id=user.id
    deposit = Envelope(user_id=user_id,category='deposit')
    withdraw = Envelope(user_id=user_id,category='withdraw')
    session.add(deposit)
    session.add(withdraw)
    session.commit()
    return

def getAccountInfoUName(userName:str,session:SessionDep)->[User]:
    stmt = select(User.id,User.user_name.label("userName"),
    User.balance,User.available_balance.label("availableBalance"),
    User.password).where(User.user_name == userName)
    return session.exec(stmt).all()

def getAccountInfo(userId:int,session:SessionDep)->[User]:
    stmt= select(User.id,User.user_name.label("userName"),
    User.balance,User.available_balance.label("availableBalance"),
    User.password).where(User.id==userId)
    return session.exec(stmt).all()

def getEnvelopeInfo(userId:int,session:SessionDep)->[Envelope]:
    stmt=select(Envelope.id,Envelope.category,Envelope.budget,Envelope.spent)\
    .where(Envelope.user_id==userId).order_by(Envelope.id)
    return session.execute(stmt).all() 

def getTransactionInfo(userId:int,session:SessionDep)->[Transaction]:
    stmt=select(Transaction.id,Envelope.category,Transaction.amount,
    func.DATE_FORMAT(Transaction.tr_date,'%m-%d-%Y').label('date'),
    Transaction.description)\
    .join(Envelope).where(Envelope.user_id==userId)\
    .order_by(Transaction.tr_date.desc(),
    Transaction.id.desc())
    return session.execute(stmt).all() 

def updateAccountInfo(userId:int, password:str, balance:float, 
availableBalance:float,session:SessionDep)->None:
    user = session.exec(select(User).where(User.id==userId)).first()
    if password:
        user.password=password
    if balance:
        user.balance=balance
    if availableBalance:
        user.available_balance=availableBalance
    session.add(user)
    session.commit()
    return

def createNewEnvelope(userId:int,category:str,budget:float,session:SessionDep)->dict:
    envelope=Envelope(user_id=userId,category=category,budget=budget)
    session.add(envelope)
    session.commit()
    session.refresh(envelope)
    return [{'id':envelope.id}]


def destroyEnvelope(envelopeId:int,session:SessionDep)->None:
    envelope = session.exec(select(Envelope).where(Envelope.id==envelopeId))\
    .first()
    session.delete(envelope)
    session.commit()
    return

def updateEnvelope(envelopeId:int, budget:float,
spent:float,session:SessionDep)->None:
    envelope = session.exec(select(Envelope).where(Envelope.id==envelopeId))\
    .first()
    envelope.budget=budget
    envelope.spent=spent
    session.add(envelope)
    session.commit()

def createTransaction(envelopeId:int, amount:float,
date:datetime,description:str,session:SessionDep)->None:
    transaction=Transaction(envelope_id=envelopeId,amount=amount,
    tr_date=date,description=description)
    session.add(transaction)
    session.commit()

