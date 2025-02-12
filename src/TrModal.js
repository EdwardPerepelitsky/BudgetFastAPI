import { useState } from "react"
import { callBackend } from "./api";
import { MovableModal } from "./MoveableModal";




export const TrModal = ({envelopes,setEnvelopes,accountInfo,
    setAccountInfo,onLogout,setShowCrTr,maxZ,setMaxZ}) =>{

    const [trCatIdx,setTrCatIdx] = useState(-1);
    const [trAmount,setTrAmount] = useState('')
    const [trDate,setTrDate] = useState('')
    const[trDesc,setTrDesc] = useState('')
    const [errorMessageTr, setErrorMessageTr] = useState()



    const handleTr =  async e => {
        e.preventDefault();
        if(isNaN(Number(trAmount))){
            setErrorMessageTr('Amount must be a number.')
            return
        }
        if(Number(trAmount)<=0){
            setErrorMessageTr('Amount must be positive.')
            return
        }
        
        if(Number(trCatIdx)===-1){
            setErrorMessageTr('Please choose a category.')
            return
        }

        if(trDate===''){
            setErrorMessageTr('Please choose a date.')
            return
        }

        

        const envIdx = Number(trCatIdx)
        const url = 'users/addtransaction'
        let body;
        const envId = envelopes[envIdx].id
        const envCategory = envelopes[envIdx].category
        const budget = envelopes[envIdx].budget
        const spent = envelopes[envIdx].spent
        if(envCategory==='deposit' || envCategory==='withdraw'){
            body = {eId:envId,amount:trAmount,typeTr:envCategory,
                date:trDate,description:trDesc}
        }
        else {
            
            body={eId:envId,amount:trAmount,budget:budget,spent:spent,
                date:trDate,description:trDesc}
        }
        try{
            const res = await callBackend(url,'POST',{},body)
            setTrAmount('')
            setTrCatIdx(-1)
            setTrDate('')
            setTrDesc('')
            setErrorMessageTr()
            res.userName = accountInfo.userName
            if(envCategory==='deposit' || envCategory==='withdraw'){
                setAccountInfo(res)
            }
            else {
                res.availableBalance = accountInfo.availableBalance
                setEnvelopes([...envelopes.slice(0,envIdx),
                {id:envId,category:envCategory,
                    budget:res['envBudget'],spent:res['envSpent']},
                ...envelopes.slice(envIdx+1)
                ])
                delete res['envBudget']
                delete res['envSpent']
                setAccountInfo(res)
            }
        }
        
        catch(ex){

            if(ex.code===401){
                onLogout()
            }

            else if (ex.details && ex.details.message){
                setErrorMessageTr(ex.details.message)
            }
            else if (ex.message){
                setErrorMessageTr(ex.message)
            }
            else{
                setErrorMessageTr('Error')
            }
            
        }       
    }

    return(
        <MovableModal
            id = {"crTrW"}
            title = {<span> Create Transaction </span>}
            setShowModal={setShowCrTr}
            maxZ={maxZ}
            setMaxZ={setMaxZ}
        >
            <form onSubmit={handleTr} >
                <select 
                    value={trCatIdx} 
                    onChange={e => setTrCatIdx(e.target.value)}
                >
                    <option value={-1}>
                        Choose category
                    </option>
                    {
                        envelopes.map((e,indx)=>
                            <option 
                                key={e.id} 
                                value={indx}
                            >
                                {e.category}
                            </option>
                        )
                    }
                </select>
                <br/>
                <input 
                    type="text" 
                    placeholder="Amount" 
                    onChange={e => setTrAmount(e.target.value)} value={trAmount}
                />
                <br/>
                <input
                    type="date"
                    onChange={e => setTrDate(e.target.value)} value={trDate}
                />
                <br/>
                <textarea
                    placeholder="Description" 
                    onChange={e => setTrDesc(e.target.value)} 
                    value={trDesc}
                    rows={5}
                    cols = {50}
                    maxLength={1000}
                />
                <br/>
                <input type="submit" value="Add Transaction"/>
                {errorMessageTr && 
                <span className="formError">
                    {errorMessageTr} 
                </span>
                }
            </form>
  
        </MovableModal>
    )
        
}