import {useContext, useState} from 'react'
import { assets } from '../assets/assets'
import {Link, NavLink } from 'react-router-dom'
import {ShopContext} from '../context/ShopContext'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const {setShowSearch , getCartCount,token,setToken,setCartItems} = useContext(ShopContext)
    const navigate = useNavigate(); 

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    toast.success("Logged out successfully")
    navigate('/login')
  }

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to='/'><img src={assets.logo} className='w-28' /></Link>

      <ul className='hidden gap-5 text-sm text-gray-700 sm:flex'>
        <NavLink to='/' className='flex flex-col items-center gap-1'>
          <p>HOME</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700 ' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
          <p>COLLECTION</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700 ' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1'>
          <p>ABOUT</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700 ' />
        </NavLink>
        <NavLink to='/blog' className='flex flex-col items-center gap-1'>
          <p>BLOG</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700 ' />
        </NavLink>
        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
          <p>CONTACT</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700 ' />
        </NavLink>
      </ul>
      <div className='flex items-center gap-6'>
        <img onClick={()=>setShowSearch(true)} className="w-5 cursor-pointer" src={assets.search_icon} alt="" />
        <div className='group relative'>
        <img onClick={()=> token ? null: navigate('/login') } src={assets.profile_icon} className='w-5 cursor-pointer' alt="Profile Icon" />
         {token && (
          <div className='absolute right-0 z-10 hidden pt-4 group-hover:block'>
            <div className='flex w-36 flex-col gap-2 rounded bg-slate-100 px-5 py-3 text-gray-500'>
              <p className="cursor-pointer hover:text-black">My Profile</p>
              <p  onClick={()=>navigate('/orders')}className="cursor-pointer hover:text-black">Orders</p>
              <p onClick={logout} className="cursor-pointer hover:text-black">Logout</p>
            </div>
          </div>
          )}   
        </div>
        <Link to='/cart' className='relative'>
        <img src={assets.cart_icon} className='w-5 min-w-5 cursor-pointer' alt="Cart"/>
          <p className='absolute bottom-[-5px] right-[-5px] aspect-square w-4 rounded-full bg-black text-center text-[8px] leading-4 text-white'>{getCartCount()}</p>
        </Link>
        <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
      </div>
      <div className={`absolute inset-y-0 right-0 z-10 overflow-hidden bg-white transition-all ${visible ? "w-full" :"w-0"}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3'>
          <img className="h-5 rotate-180" src={assets.dropdown_icon} alt="" />
          <p>Back</p>
        </div>
        <NavLink onClick={()=>setVisible(false)} className='border py-2 pl-6' to='/'>Home</NavLink>
        <NavLink onClick={()=>setVisible(false)} className='border py-2 pl-6' to='/collection'>COLLECTION</NavLink>
        <NavLink onClick={()=>setVisible(false)} className='border py-2 pl-6' to='/about'>ABOUT</NavLink>
        <NavLink onClick={()=>setVisible(false)} className='border py-2 pl-6' to='/blog'>BLOG</NavLink>
        <NavLink onClick={()=>setVisible(false)} className='border py-2 pl-6' to='/contact'>CONTACT</NavLink>
      </div>
      </div>
    </div>
  )
}

export default Navbar
