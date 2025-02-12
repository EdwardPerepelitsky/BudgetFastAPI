import { useEffect, useState,useRef } from "react"
import { callBackend } from "./api";
import { DialogModal } from "./DialogModal";
import { Dropdown } from "./Dropdown";
import { PwdForm } from "./PwdForm";
import { Transactions } from "./Transactions";
import { TrModal } from "./TrModal";
import { determineBrowser } from "./determineBrowser";
import { useHistory } from "react-router-dom"



export const BankingPage = ({onLogout}) => {

    const history = useHistory()

    history.push('/BankingPage')

    const [accountInfo,setAccountInfo] = useState()
    const [accErrMessage, setAccError] = useState()
    const [envelopes,setEnvelopes] = useState()
    const [envErrMessage, setEnvError] = useState()
    const [catName,setCatName] = useState('');
    const [budget,setBudget] = useState('');
    const [errorMessageAddEnv, setErrorMessageAddEnv] = useState()
    const [envAction,setEnvAction] = useState('Choose action')
    const [envCategoryIdx,setEnvCategoryIdx] = useState(-1)
    const [envAmount,setEnvAmount] = useState('')
    const [errorMessageEnvChange,setErrorMessageEnvChange] = useState()
    const [remEnvIdx, setRemEnvIdx] = useState()
    const [showForm,setShowForm] = useState(false)
    const [showTr,setShowTr] = useState(false)
    const [showCrTr,setShowCrTr] = useState(false)
    const [maxZ,setMaxZ] = useState(10)

    const ref = useRef()

    const handleLoad =  () => {
       
        const fullWidth = window.outerWidth
        const fullWidthSt = 1419;
        const rootFont = fullWidth/fullWidthSt * 16
        const stubHeight = 14.859375
        const fullHeight  = window.innerHeight/rootFont
        const remHeight = fullHeight - stubHeight
        const envHeight = Math.max(remHeight-0.5,14.1)
        document.documentElement.style.setProperty('font-size',`${rootFont}px`)
        const htmlWidthPx = 88.6875 * rootFont
        document.documentElement.style.setProperty('width',`${htmlWidthPx}px`)
        ref.current.style.setProperty('height',`${envHeight}rem`)
    }
    
    
    useEffect(() => {

		(async () => {
			try {
                setEnvelopes(await callBackend('users/envelopeinfo','GET',{}))
			}
			catch (ex) {

                if(ex.code===401){
                    onLogout()
                }

				else if (ex.details && ex.details.message){
                    setEnvError(ex.details.message)
                }
                else if (ex.message){
                    setEnvError(ex.message)
                }
                else{
                    setEnvError('Error')
                }
			}

            try {
                setAccountInfo(await callBackend('users/account','GET',{}))
                handleLoad()
            }
            catch (ex) {

                if(ex.code===401){
                    onLogout()
                }

                else if (ex.details && ex.details.message){
                    setAccError(ex.details.message)
                }
                else if (ex.message){
                    setAccError(ex.message)
                }
                else{
                    setAccError('Error')
                }
            }

		})()

	},[])
    
    useEffect(()=>{
        window.addEventListener('resize',handleLoad,true)

        return () => {
            window.removeEventListener('resize', handleLoad,true);
        };

    },[])

    async function handleLogOut() {
        
        try{
            localStorage.removeItem("token")
            onLogout()
            
        }
        catch(ex){
                console.log(ex)
                onLogout()
        }
      }


    const handleAddEnv = async e => {
        e.preventDefault();
        if(isNaN(Number(budget))){
            setErrorMessageAddEnv('Budget amount must be a number.')
            return
        }
        if(Number(budget)<0){
            setErrorMessageAddEnv('Amount must be positive.')
            return
        }
        if(['deposit','withdraw',''].includes(catName)){
            setErrorMessageAddEnv("Category name can't be 'deposit,'withdraw',or ''.")
            return
        }
        try{
            const res = await callBackend('users/addenvelope','POST',{},
            {category:catName,budget:budget})
            setBudget('')
            setCatName('')
            setErrorMessageAddEnv()
            setEnvelopes([...envelopes,{id:res.envId,category:catName,
                budget:budget===''?'0':budget,spent:'0'}])
            res.balance = accountInfo.balance
            res.userName = accountInfo.userName
            delete res['envId']
            setAccountInfo(res)
        }
        catch(ex){

            if(ex.code===401){
                onLogout()
            }

            else if (ex.details && ex.details.message && ex.details.message.detail){
                if(ex.details.message.detail.includes('Key (user_id, category)')){
                    setErrorMessageAddEnv('Envelope with this category already exists.')
                }
                else{
                    setErrorMessageAddEnv(ex.message)
                }
            }

            else if (ex.details && ex.details.message){
                setErrorMessageAddEnv(ex.details.message)
            }
            else if (ex.message){
                setErrorMessageAddEnv(ex.message)
            }
            else{
                setErrorMessageAddEnv('Error')
            }
        }
           
    }

    const handleRemEnv = (index) => async (e) => {
        
        e.preventDefault()

        const env = envelopes[index]
        const remId = env.id
        const remBud = env.budget
        const remSpent = env.spent

        try{
            const res = await callBackend('users/removeenvelope','POST',{},
            {eId:remId,budget:remBud,spent:remSpent})
            setRemEnvIdx()
            setEnvelopes(envelopes.slice(0, index).concat(envelopes.slice(index+1)))
            res.userName = accountInfo.userName
            setAccountInfo(res)
        }
        catch(ex){

            if(ex.code===401){
                onLogout()
            }

            else{
                console.log(ex)
            }
        }
    }

    const handleEnvChange = async e => {
        e.preventDefault();
        if(isNaN(Number(envAmount))){
            setErrorMessageEnvChange('Amount must be a number.')
            return
        }
        if(Number(envAmount)<=0){
            setErrorMessageEnvChange('Amount must be positive.')
            return
        }

        if(envAction==='Choose action'){
            setErrorMessageEnvChange('Please choose an action.')
            return
        }

        if(Number(envCategoryIdx)===-1){
            setErrorMessageEnvChange('Please choose a category.')
            return
        }

        const envIdx = Number(envCategoryIdx)
        const url='users/updateenvelope';
        let body;
        const envId = envelopes[envIdx].id
        const envCategory = envelopes[envIdx].category
        const budget = envelopes[envIdx].budget
        const spent = envelopes[envIdx].spent
            
        if(envAction==='Add money'){
            body={eId:envId,deltaBudget:envAmount,budget:budget,spent:spent}
        }
        else{
            body={eId:envId,deltaBudget:`-${envAmount}`,budget:budget,spent:spent}
        }
            
        try{
            const res = await callBackend(url,'POST',{},body)
            setEnvAmount('')
            setEnvCategoryIdx(-1)
            setEnvAction('Choose action')
            setErrorMessageEnvChange()
            res.userName = accountInfo.userName
            res.balance = accountInfo.balance
            setEnvelopes([...envelopes.slice(0,envIdx),
            {id:envId,category:envCategory,
                budget:res['envBudget'],spent:res['envSpent']},
            ...envelopes.slice(envIdx+1)
            ])
            delete res['envBudget']
            delete res['envSpent']
            setAccountInfo(res)
        }
        
        catch(ex){

            if(ex.code===401){
                onLogout()
            }

            else if (ex.details && ex.details.message){
                setErrorMessageEnvChange(ex.details.message)
            }
            else if (ex.message){
                setErrorMessageEnvChange(ex.message)
            }
            else{
                setErrorMessageEnvChange('Error')
            }

            

        }
            
    }

    let headerTextAcc;
    let displayAccount = false;
    if (!accountInfo){
        headerTextAcc=accErrMessage
    }
    else{
        displayAccount=true
    }
      
    let headerTextEnv;
    let displayEnvelopes = false;
    let displayEnvChangeForm = false;
    if (!envelopes){
        headerTextEnv=envErrMessage
    }
    else{
        displayEnvelopes=true
        if(envelopes.length>2){
            displayEnvChangeForm = true;
        }
    }

    const accountDict = {
        userName:"Email: ",
        balance:"Balance: $",
        availableBalance:"Avaialable Balance: $"
    }

    function calcPos (index){
        const row = Math.floor(index/2)
        const col = index %2
        const top = row * 15
        const left = col * 39 + 5
        return {top:`${top}rem`,left:`${left}rem`}
    }
    
    return(
        <>  
            <div 
                className="Header"
                style={{visibility:showForm?"hidden":"visible"}}
            >
                Account Info
            </div>
            {headerTextAcc && <h2>{headerTextAcc}</h2>}

            {
                displayAccount && 
                <div 
                    id="AccContainer"
                    style={{visibility:showForm?"hidden":"visible"}}
                >
                    {
                        Object.keys(accountDict).map(
                            (a)=><span key={a}>
                                {accountDict[a]}{accountInfo[a]}
                            </span>
                        )
                    }
                    
                    <button onClick={()=>{setShowCrTr(true)}}> 
                        Add Transaction 
                    </button>

                </div>
            }

            
            <div className="Header">Envelopes</div> 
            {headerTextEnv && <h2>{headerTextEnv}</h2>}
            {
                displayEnvChangeForm &&
                <form className="env_change_form" onSubmit={handleEnvChange} >
                    <select value={envAction} 
                    onChange={e => setEnvAction(e.target.value)}>
                        <option value={'Choose action'}>Choose action</option>
                        <option value={'Add money'}>Add money</option>
                        <option value={'Remove money'}>Remove money</option>
                    </select>
                    <select value={envCategoryIdx} 
                    onChange={e => setEnvCategoryIdx(e.target.value)}>
                        <option value={-1}>
                            Choose category
                        </option>
                        {
                            envelopes.slice(2).map((e,indx)=>
                                <option key={e.id} value={indx+2}>
                                    {e.category}
                                </option>
                            )
                        }
                    </select>
                    <input type="text" placeholder="Amount" 
                    onChange={e => setEnvAmount(e.target.value)} value={envAmount}/>
                    <input type="submit" value="Execute"/>
                    {errorMessageEnvChange && <span className="formError">
                        {errorMessageEnvChange} </span>}
                </form>
            }

            {
                displayEnvelopes && 
                <div id="envContainer" >
                    {envelopes.slice(2).map(
                        (e,index)=>
                        <div 
                            className="env" 
                            key={e.id}
                            style={calcPos(index)}
                        >
                            <div className="env_h_cat">Category: {e.category}</div>
                            <div className="env_headers">
                                <span className="env_header">Budget: ${e.budget}</span>
                                <span className="env_header">Spent: ${e.spent}</span>
                            </div>
                            <button className="remEnv" onClick={()=>setRemEnvIdx(index+2)}>
                                x
                            </button>
                        </div>
                    )}
                    <div 
                        className="env"
                        style={calcPos(envelopes.length-2)}
                    >
                        <form onSubmit={handleAddEnv} >
                            <input 
                                type="text" 
                                placeholder="Category" 
                                onChange={e => setCatName(e.target.value)} value={catName}
                            /><br/>
                            <input 
                                type="text" 
                                placeholder="Budget"
                                onChange={e => setBudget(e.target.value)} 
                                value={budget}
                            /><br/>
                            <input 
                                type="submit" 
                                value="Add Envelope"
                            />   
                            {errorMessageAddEnv && <span className="formError">
                                {errorMessageAddEnv} </span>}
                        </form>
                    </div>
                </div>
            }

            <Dropdown 
                id={"accountDropPos"}
                trigger = {<button>Account</button>}
                menu = {[
                    <button 
                        onClick={()=>{setShowTr(true)}}

                    > 
                        See transactions 
                    </button>,
                    <button onClick={()=> setShowForm(true)}> Change password </button>,
                    <button onClick={handleLogOut}> Logout </button>
                ]}
                menuId = {"accountMenu"}
            />

            {
                showForm&& 
                <PwdForm
                    id = {"pwdForm"}
                    setShowForm={setShowForm}
                    onLogout={onLogout}
                />
            }

            {
                showCrTr&&
                <TrModal
                    envelopes = {envelopes}
                    setEnvelopes = {setEnvelopes}
                    accountInfo = {accountInfo}
                    setAccountInfo = {setAccountInfo}
                    onLogout = {onLogout}
                    setShowCrTr = {setShowCrTr}
                    maxZ={maxZ}
                    setMaxZ = {setMaxZ}
                />
            }

            {
                showTr&&
                <Transactions 
                    envelopes={envelopes}
                    onLogout={onLogout} 
                    setShowTr={setShowTr}
                    maxZ={maxZ}
                    setMaxZ={setMaxZ}
                />
            }

            {   
                remEnvIdx &&
                <DialogModal
                    onProceed={handleRemEnv(remEnvIdx)}
                    onClose={() => setRemEnvIdx()}
                >
                    <p>
                        Are you sure you would like to delete the envelope {<br/>} 
                        {<b>{envelopes[remEnvIdx].category}</b>} {' '} 
                        and all concomitant transactions?
                    </p>

                </DialogModal>
            }
                            
        </>
    )
}