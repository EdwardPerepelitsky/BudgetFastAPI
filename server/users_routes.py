import games_queries as gq
import Authentication as auth
from fastapi import HTTPException,Body,APIRouter,Request
from flask_bcrypt import Bcrypt
from queries import SessionDep
from sqlalchemy.exc import IntegrityError

usersRouter = APIRouter()
bcrypt=Bcrypt()

def dict_from_row(row):
    return dict((field,value) for (field,value) in zip(row._fields,row._data))
    
@usersRouter.post('/signup')
def signup(session: SessionDep, payload: dict = Body(...)):
    
    userName = payload['user_name']
    password = payload['password']

    if userName=='' or password=='':
        raise HTTPException(
                status_code=400,
                detail="Email and password must be non-empty.",
            )
    try:
        hashedPass = bcrypt.generate_password_hash(password, 10)
        gq.createAccount(userName,hashedPass,session)
    except IntegrityError as e:
        
        if "key 'user_name'" in e.args[0]:
            raise HTTPException(
                status_code=409,
                detail="Email already exists. Please pick a different email.",
            )
            
        raise HTTPException(
            status_code=400,
        )
        
    return {'data':{
        'user_name':userName
    }}

@usersRouter.post('/login')
def login(session: SessionDep, payload: dict = Body(...)):

    userName = payload['user_name']
    password = payload['password']
    try:
        user = auth.authenticate_user(userName,password,session)
    except Exception as e:
        e_det=e.__str__()
        if e_det=='User not found':
            raise HTTPException(
                status_code=404,
                detail="Email not found.",
            )
        elif e_det=='Wrong password':
            raise HTTPException(
                status_code=401,
                detail="Wrong password.",
            )
        raise HTTPException(
            status_code=400,
        )

    tokenData={}
    id = int(user.id)
    balance = float(user.balance)
    availableBalance = float(user.availableBalance)
    tokenData['userId'] = id
    tokenData['balance'] = balance
    tokenData['availableBalance'] = availableBalance
    tokenData['userName'] = userName
    access_token=auth.create_access_token(tokenData)
    return auth.Token(access_token=access_token, token_type="bearer")

@usersRouter.get('/account')
def account(request:Request,session: SessionDep):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to view your account.",
        )
    userId = tokenData['userId']
    accountInfo = gq.getAccountInfo(userId,session)
    accountInfo = dict_from_row(accountInfo[0])
    del accountInfo['password']
    access_token=auth.create_access_token(tokenData)
    return {'data':accountInfo,'access_token':access_token}

@usersRouter.get('/envelopeinfo')
def envelopeinfo(request:Request,session: SessionDep):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to get envelope info.",
        )
    userId = tokenData['userId']
    envelopeInfo = gq.getEnvelopeInfo(userId,session)
    access_token=auth.create_access_token(tokenData)
    return {
        'data':[dict_from_row(row) for row in envelopeInfo],
        'access_token':access_token
    }


@usersRouter.get('/transactioninfo')
def transactioninfo(request:Request,session: SessionDep):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to get transaction info.",
        )
    userId = tokenData['userId']
    transactionInfo = gq.getTransactionInfo(userId,session)
    access_token=auth.create_access_token(tokenData)
    return {
        'data':[dict_from_row(row) for row in transactionInfo],
        'access_token':access_token
    }

@usersRouter.post('/password')
def password(request:Request,session: SessionDep,payload: dict = Body(...)):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to change your password.",
        )
    userId = tokenData['userId']
    password = payload['password']
    newPassword = payload['newPassword']
    try:
        info = gq.getAccountInfo(userId,session)
    except:
        raise HTTPException(
            status_code=400,
        )
    if len(info) == 0:
        raise HTTPException(
            status_code=404,
            detail="Email not found.",
        )
    info = info[0]
    hashedPass = info.password
    try:
        comparison = bcrypt.check_password_hash(hashedPass,password)
    except:
        raise HTTPException(
            status_code=400,
        )
    if comparison is False:
        raise HTTPException(
            status_code=401,
            detail="Wrong password.",
        )
    try:
        hashedNewPass = bcrypt.generate_password_hash(newPassword, 10)
    except: 
        raise HTTPException(
            status_code=400,
        )
    gq.updateAccountInfo(userId, hashedNewPass, None, None,session)
    access_token=auth.create_access_token(tokenData)
    return {
        'data':{'message':'You have successfully changed your password.'},
        'access_token':access_token
    }

@usersRouter.post('/addenvelope')
def addenvelope(request:Request,session: SessionDep,payload: dict = Body(...)):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to add an envelope.",
        )
    userId = tokenData['userId']
    category = payload['category']
    budget = float(payload['budget'])
    availableBalance = tokenData['availableBalance']
    if budget > availableBalance:
        raise HTTPException(
            status_code=409,
            detail="You can't allocate more money than your available balance.",
        )
    availableBalance = availableBalance - budget
    try:
        envId=gq.createNewEnvelope(userId, category, budget,session)[0]['id']
        gq.updateAccountInfo(userId, None, None, availableBalance,session)
    except:
        raise HTTPException(
            status_code=500,
        )
        
    tokenData['availableBalance'] = availableBalance
    access_token=auth.create_access_token(tokenData)
    return {
        'data':{
            'availableBalance': availableBalance,
            'envId' : envId
            },
        'access_token':access_token
    }

@usersRouter.post('/removeenvelope')
def removeenvelope(request:Request,session: SessionDep,payload: dict = Body(...)):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to remove an envelope.",
        )
    userId = tokenData['userId']
    eId = payload['eId']
    budget = float(payload['budget'])
    spent = float(payload['spent'])
    availableBalance = tokenData['availableBalance']
    balance = tokenData['balance']
    availableBalance = availableBalance + budget + spent
    balance = balance + spent
    
    try:
        gq.destroyEnvelope(eId,session)
        gq.updateAccountInfo(userId, None, balance ,availableBalance,session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
        )
    tokenData['availableBalance'] = availableBalance
    tokenData['balance'] = balance
    access_token=auth.create_access_token(tokenData)
    return {
        'data':{
            'availableBalance': availableBalance,
            'balance': balance
        },
        'access_token':access_token
    }

@usersRouter.post('/updateenvelope')
def updateenvelope(request:Request,session: SessionDep,payload: dict = Body(...)):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to update an envelope.",
        )
    userId = tokenData['userId']
    eId = payload['eId']
    deltaBudget = float(payload['deltaBudget'])
    envBudget = float(payload['budget'])
    envSpent = float(payload['spent'])
    availableBalance = tokenData['availableBalance']

    if deltaBudget > availableBalance:
        raise HTTPException(
            status_code=409,
            detail="You can't allocate more money than your available balance.",
        )
       
    if deltaBudget < - envBudget:
        raise HTTPException(
            status_code=409,
            detail="You can't lower envelope budget below 0.",
        )

    envBudget = envBudget + deltaBudget
    availableBalance = availableBalance - deltaBudget
    gq.updateEnvelope(eId, envBudget,envSpent,session)
    gq.updateAccountInfo(userId, None, None, availableBalance,session)
    tokenData['availableBalance'] = availableBalance
    access_token=auth.create_access_token(tokenData)
    return {
        'data':{
            'availableBalance': availableBalance,
            'envBudget': envBudget,
            'envSpent': envSpent
        },
        'access_token':access_token
    }

@usersRouter.post('/addtransaction')
def addtransaction(request:Request,session: SessionDep,payload: dict = Body(...)):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to add a transaction.",
        )
    userId = tokenData['userId']
    eId = payload['eId']
    if 'typeTr' in payload:
        typeTr = payload['typeTr']
    else:
        typeTr=''
    amount = float(payload['amount'])
    date  = payload['date']
    description = payload['description']

    balance = tokenData['balance']
    availableBalance = tokenData['availableBalance']

    if typeTr=='deposit':
        balance = balance + amount
        availableBalance = availableBalance + amount
        gq.createTransaction(eId,amount,date,description,session)
        gq.updateAccountInfo(userId, None, balance, availableBalance,session)
        tokenData['balance'] = balance
        tokenData['availableBalance'] = availableBalance
        access_token=auth.create_access_token(tokenData)
        return {
            'data':{
                'balance': balance,
                'availableBalance': availableBalance
            },
            'access_token':access_token
        }

    if typeTr=='withdraw':
        if amount > availableBalance:
            raise HTTPException(
            status_code=409,
            detail="You can't withdraw more money than available.",
        )
        balance = balance - amount
        availableBalance = availableBalance - amount
        gq.createTransaction(eId, amount,date,description,session)
        gq.updateAccountInfo(userId, None, balance, availableBalance,session)
        tokenData['balance'] = balance
        tokenData['availableBalance'] = availableBalance
        access_token=auth.create_access_token(tokenData)
        return {
            'data':{
                'balance': balance,
                'availableBalance': availableBalance
            },
            'access_token':access_token
        }

    envelopeBalance = float(payload['budget'])
    envelopeSpent = float(payload['spent'])
    
    if amount > envelopeBalance:
        raise HTTPException(
            status_code=409,
            detail="You can't spend more money than allocated for this category.",
        )
    envelopeBalance = envelopeBalance - amount
    envelopeSpent = envelopeSpent + amount
    balance = balance - amount
    gq.createTransaction(eId, amount,date,description,session)
    gq.updateEnvelope(eId,envelopeBalance,envelopeSpent,session)
    gq.updateAccountInfo(userId, None, balance, None,session)
    tokenData['balance'] = balance
    access_token=auth.create_access_token(tokenData)
    return {
        'data':{
            'envBudget': envelopeBalance,
            'envSpent': envelopeSpent,
            'balance': balance
        },
        'access_token':access_token
    }

@usersRouter.get('/checkLogin')
def account(request:Request):
    try:
        token=request.headers['authorization'].split(' ')[1]
        tokenData=auth.get_current_user(token)
        access_token=auth.create_access_token(tokenData)
        return {
            'data':{
                'message': 'Logged in',
            },
            'access_token':access_token
        }
    except:
        return {
            'data':{
                'message': 'Logged out',
            }
        }








