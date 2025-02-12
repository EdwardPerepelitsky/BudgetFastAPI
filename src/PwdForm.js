import { useEffect, useState, useRef } from "react"
import { callBackend } from "./api";

const isCloseTo = (e, element) => {

    const r = element.getBoundingClientRect();

    return (
      e.clientX - r.left > -20 &&
      e.clientX - r.right < 20 &&
      e.clientY - r.top > -20 &&
      e.clientY - r.bottom < 20
    );
};


const useOutsideClick = (callback) => {
    const ref = useRef();
  
    useEffect(() => {
        const handleClick = (event) => {

        if (ref.current && !isCloseTo(event,ref.current))
            {
                callback();
            }
        };

        document.addEventListener('click', handleClick,true);

        return () => {
          document.removeEventListener('click', handleClick,true);
        };
    }, [ref]);

    return ref;
};


    

export const PwdForm = ({id,setShowForm,onLogout}) => {

    const [oldPwd,setOldPwd] = useState('')
    const [newPwd,setNewPwd] = useState('')
    const [newPwdCon,setNewPwdCon] = useState('')
    const [errorMessageChPwd,setErrorMessageChPwd] = useState()

    const handleSubForm = async e => {
        e.preventDefault();

        if(newPwd==='' || oldPwd===''){
            setErrorMessageChPwd('Password must be non-empty.')
            return
        }
        
        if(newPwd!==newPwdCon){
            setErrorMessageChPwd('Passwords do not match.')
            return
        }

        const url='users/password'
        const body = {
            password:oldPwd,
            newPassword:newPwd
        }

        try{
            await callBackend(url,'POST',{},body)
            setShowForm(false)
            setOldPwd('')
            setNewPwd('')
            setNewPwdCon('')
            setErrorMessageChPwd()
        }
        
        catch(ex){

            if(ex.code===401){

                if (ex.message && ex.message.includes('Wrong password')){
                        setErrorMessageChPwd(ex.message)
                    }
                else{
                    onLogout()
                }

            }

            else{

                if (ex.details && ex.details.message){
                    setErrorMessageChPwd(ex.details.message)
                }
                else if (ex.message){
                    setErrorMessageChPwd(ex.message)
                }
                else{
                    setErrorMessageChPwd('Error')
                }
            }
        }     
    }

    const handleClickOutside = () => {
        setShowForm(false);
    };

    const ref = useOutsideClick(handleClickOutside);

    const handleCheckbox = (ref) => {

        if (ref.current.type==='password'){
            ref.current.type = 'text'
        }
        else{
            ref.current.type='password'
        }
    }

    const ref1 = useRef();
    const ref2 = useRef();
    const ref3 = useRef();


    return(
        
        <div id={id} ref={ref}>
            <form onSubmit={handleSubForm} className="form">  
                <input 
                    type="password" placeholder="Old password" ref={ref1} 
                    onChange={e => setOldPwd(e.target.value)} value={oldPwd}
                    onCut={(e)=>{e.preventDefault();return false}}
                    onCopy={(e)=>{e.preventDefault();return false}}
                    onPaste={(e)=>{e.preventDefault();return false}}
                />
                <input 
                    type="checkbox" 
                    onClick={()=>{handleCheckbox(ref1)}}
                />
                <span >Show password</span>
                <br/>
                <input 
                    type="password" placeholder="New password" ref={ref2}
                    onChange={e => setNewPwd(e.target.value)} value={newPwd}
                    onCut={(e)=>{e.preventDefault();return false}}
                    onCopy={(e)=>{e.preventDefault();return false}}
                    onPaste={(e)=>{e.preventDefault();return false}} 
                />
                <input 
                    type="checkbox" 
                    onClick={()=>{handleCheckbox(ref2)}}
                />
                <span>Show password</span>
                <br/>
                <input 
                    type="password" placeholder="Confirm new password" ref={ref3}
                    onChange={e => setNewPwdCon(e.target.value)} value={newPwdCon}
                    onCut={(e)=>{e.preventDefault();return false}}
                    onCopy={(e)=>{e.preventDefault();return false}}
                    onPaste={(e)=>{e.preventDefault();return false}}
                />
                <input 
                    type="checkbox" 
                    onClick={()=>{handleCheckbox(ref3)}}
                />
                <span>Show password</span>
                <br/>
                <input
                    className="submitBtn" 
                    type="submit" 
                    value="Change Password"
                />
                {errorMessageChPwd && <span className="formError">
                    {errorMessageChPwd} </span>}           
            </form>
            <button 
                className="formClose" 
                onClick={()=>setShowForm(false)}
            >
                x
            </button>
        </div>
      
    )
}