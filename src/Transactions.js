import { useEffect, useState } from "react"
import { callBackend } from "./api";
import { MovableModal } from "./MoveableModal";


export const Transactions = ({envelopes,onLogout,setShowTr,maxZ,setMaxZ}) => {

    const [transactions,setTransactions] = useState()
    const [trErrMessage, setTrError] = useState()


    useEffect(() => {

		(async () => {
			try {
                setTransactions(await callBackend('users/transactioninfo','GET',
                {}))
			}
			catch (ex) {

                if(ex.code===401){
                    onLogout()
                }

				else if (ex.details && ex.details.message){
                    setTrError(ex.details.message)
                }
                else if (ex.message){
                    setTrError(ex.message)
                }
                else{
                    setTrError('Error')
                }
			}

		})()

	},[])

    let headerTextTr;
    let displayTransactions = false;
    if (!transactions){
        headerTextTr=trErrMessage
    }

    else if(transactions.length===0){
        headerTextTr = 'No transactions'
    }

    else{
        displayTransactions=true
    }

    return(
        <MovableModal
            title={<span>Transactions</span>}
            setShowModal={setShowTr}
            maxZ={maxZ}
            setMaxZ={setMaxZ}
        >

            {headerTextTr && <div id="noTrText">{headerTextTr}</div>}

            {
                displayTransactions &&

                <table>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Description</th>
                    </tr>
                    {transactions.map((Tr)=>
                        <tr key={Tr.id}>
                            <td>{Tr.category}</td>
                            <td>${Tr.amount}</td>
                            <td id="dateText">{Tr.date.split('T')[0]}</td>
                            <td>{<p id="descText">{Tr.description}</p>}</td>
                        </tr>
                    )}
                </table>
            }

        </MovableModal>
    )
    
}