import {  useState,useRef,useEffect } from "react"
import {Link} from 'react-router-dom'
import { callBackend } from "./api";
import { useHistory } from "react-router-dom";

function validateEmail(email){
    const validRegex = /^([_-]?[a-zA-Z0-9]+)([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9-]+[a-zA-Z0-9]$/
    return(email.match(validRegex))
}

export const Register = () => {

    const history = useHistory();
    
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [errorMessage, setError] = useState()

    const handleLoad =  () => {
       
        const rootFont = `16px`
        document.documentElement.style.setProperty('font-size',rootFont)
    }

    useEffect(() => {
		(() => {
            handleLoad()
		})()
	},[])

    const handleSubmit = async e => {
        e.preventDefault();

        if(!validateEmail(email)){
            setError('Please enter a valid email.')
            return
        }

        try{
            await callBackend('users/signup','POST',{},
            {user_name:email.toLowerCase(),password:password})

            history.push("/Login");
            
        
        }
        
        catch(ex){

            // setEmail('')
            // setPassword('')

            if (ex.details && ex.details.message){
                setError(ex.details.message)
            }
            else if (ex.message){
                setError(ex.message)
            }
            else{
            }
        }

      }

      const ref=useRef()

      const handleCheckbox = () => {
        if (ref.current.type==='password'){
            ref.current.type = 'text'
        }
        else{
            ref.current.type='password'
        }
      }

    return(
        <div>
            <div className="loginHeader">Register</div>
            <form className="loginForm" onSubmit={handleSubmit} >
                <input type="text" placeholder="Email" 
                onChange={e => setEmail(e.target.value)} value={email}/><br/>
                <input 
                    type="password" placeholder="Password" ref={ref}
                    onChange={e => setPassword(e.target.value)} value={password}
                    onCut={(e)=>{e.preventDefault();return false}}
                    onCopy={(e)=>{e.preventDefault();return false}}
                    onPaste={(e)=>{e.preventDefault();return false}} 
                />
                <input type="checkbox" 
                onClick={handleCheckbox}/>
                <span>Show password</span>
                <br/>
                <input type="submit" value="Register"/>
                {errorMessage && <span className="formError">
                    {errorMessage} </span>}
            </form>

            <Link to={"/Login"}>Back to Login.</Link>
            
        </div>
    )
}