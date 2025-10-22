import {useContext, useState, useEffect} from 'react'
import { assets } from '../assets/assets'
import {Link, NavLink } from 'react-router-dom'
import {ShopContext} from '../context/ShopContext'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";


// Import directly from environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const [websiteLogo, setWebsiteLogo] = useState("")
  const [loading, setLoading] = useState(false) // Start with false to avoid blocking render
  const {setShowSearch , getCartCount,token,setToken,setCartItems} = useContext(ShopContext)
  const navigate = useNavigate(); 

  // Fetch website logo from backend - with better error handling
  useEffect(() => {
    const fetchWebsiteLogo = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching website logo from:', `${backendUrl}/api/business-details`);
        
        const response = await axios.get(`${backendUrl}/api/business-details`, {
          timeout: 5000 // 5 second timeout
        });
        
        console.log('📦 API Response:', response.data);
        
        if (response.data.success && response.data.data?.logos?.website?.url) {
          setWebsiteLogo(response.data.data.logos.website.url);
          console.log('✅ Website logo loaded:', response.data.data.logos.website.url);
        } else {
          console.log('ℹ️ No website logo found in response, using asset logo');
          setWebsiteLogo("");
        }
      } catch (error) {
        console.error('❌ Error fetching website logo:', error);
        console.log('🔄 Falling back to asset logo');
        setWebsiteLogo("");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if backendUrl is available
    if (backendUrl) {
      fetchWebsiteLogo();
    } else {
      console.log('❌ backendUrl not available, using asset logo');
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    toast.success("Logged out successfully")
    navigate('/login')
  }

  // Simple logo display - always show something
  const LogoDisplay = () => {
    // If we have a website logo and not loading, use it
    if (!loading && websiteLogo) {
      return (
        <img 
          src={websiteLogo} 
          alt="Website Logo" 
          className='w-28 object-contain'
          onError={(e) => {
            console.error('❌ Website logo failed to load, showing asset logo');
            // Show asset logo if website logo fails
            e.target.src = assets.logo;
          }}
        />
      );
    }

    // Always show asset logo as fallback (during loading or if no website logo)
    return (
      <img src={assets.logo} className='w-28 object-contain' alt="Logo" />
    );
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to='/'><LogoDisplay /></Link>

      <ul className='hidden gap-5 text-sm text-gray-700 sm:flex'>
        <NavLink 
          to='/' 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-black' : ''}`
          }
        >
          <p>HOME</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700' />
        </NavLink>
        <NavLink 
          to='/collection' 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-black' : ''}`
          }
        >
          <p>COLLECTION</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700' />
        </NavLink>
        <NavLink 
          to='/about' 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-black' : ''}`
          }
        >
          <p>ABOUT</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700' />
        </NavLink>
        <NavLink 
          to='/blog' 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-black' : ''}`
          }
        >
          <p>BLOG</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700' />
        </NavLink>
        <NavLink 
          to='/contact' 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-black' : ''}`
          }
        >
          <p>CONTACT</p>
          <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700' />
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
                <p onClick={()=>navigate('/orders')} className="cursor-pointer hover:text-black">Orders</p>
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
      
      {/* Mobile menu */}
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