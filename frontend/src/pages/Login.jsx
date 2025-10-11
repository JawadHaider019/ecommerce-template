import axios from "axios"
import { useState ,useContext, useEffect} from "react"
import { ShopContext } from "../context/ShopContext"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [currentState, setCurrentState ]= useState('Login') 
  const {token, setToken, backendUrl} = useContext(ShopContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate(); 
    
  const onSubmitHandler = async (event) =>{
    event.preventDefault()
    try {
      if(currentState === 'Sign Up'){
        const response = await axios.post(`${backendUrl}/api/user/register`, {name,email,password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success("Account created successfully ")
          navigate("/") 
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, {email,password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success("Logged in successfully ")
          navigate("/") 
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if(token){
      navigate('/')
    }
  }, [token, navigate])

  return (
    <form onSubmit={onSubmitHandler} className="m-auto mt-14 flex w-[90%] flex-col items-center gap-4 text-gray-800 sm:max-w-96">
      <div className="mb-2 mt-10 inline-flex items-center gap-2">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="h-[1.5px] w-8 border-none bg-gray-800"/>
      </div>

      {currentState === 'Login' ? null : (
        <input 
          onChange={(e)=>setName(e.target.value)} 
          value={name} 
          type="text" 
          className="w-full border border-gray-800 px-3 py-2" 
          placeholder="Name" 
          required 
        />
      )}

      <input 
        onChange={(e)=>setEmail(e.target.value)} 
        value={email} 
        type="email" 
        className="w-full border border-gray-800 px-3 py-2" 
        placeholder="Email" 
        required
      />

      <input 
        onChange={(e)=>setPassword(e.target.value)} 
        value={password} 
        type="password" 
        className="w-full border border-gray-800 px-3 py-2" 
        placeholder="Password" 
        required
      />

      <div className="mt-[-8px] flex w-full justify-between text-sm">
        <p>Forgot your password?</p>
        {currentState === 'Login' 
          ? <p onClick={()=>setCurrentState('Sign Up')}>Create account</p> 
          : <p onClick={()=>setCurrentState('Login')}>Login Here</p>}
      </div>

      <button className="btn">
        {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  )
}

export default Login
