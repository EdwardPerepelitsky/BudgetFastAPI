import {  useState,useRef,useEffect } from "react"
import {Link} from 'react-router-dom'
import { callBackend } from "./api";
import { useHistory } from "react-router-dom";
export const LoginPage = ({onLogin}) => {

    const history = useHistory()

    history.push('/Login')
    
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
        try{
            await callBackend('users/login','POST',{},
            {user_name:email.toLowerCase(),password:password})
            onLogin()
            
        }
        
        catch(ex){

            if (ex.details && ex.details.message){
                setError(ex.details.message)
            }
            else if (ex.message){
                setError(ex.message)
            }
            else{
                setError('Error')
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
            <div className="loginHeader">Login</div>
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
                <input type="submit" value="Login"/>
                {errorMessage && <span className="formError">
                    {errorMessage} </span>}
            </form>

            <Link to={"/Register"}>Don't have an account? Register here.</Link>
            
        </div>
    )
}