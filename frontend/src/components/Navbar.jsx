import {useContext, useState, useEffect} from 'react'
import { assets } from '../assets/assets'
import {Link, NavLink, useLocation } from 'react-router-dom'
import {ShopContext} from '../context/ShopContext'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

// Import directly from environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [websiteLogo, setWebsiteLogo] = useState("")
  const [loading, setLoading] = useState(false)
  const {getCartCount,token,setToken,setCartItems} = useContext(ShopContext)
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch website logo from backend
  useEffect(() => {
    const fetchWebsiteLogo = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${backendUrl}/api/business-details`, {
          timeout: 5000
        });
        
        if (response.data.success && response.data.data?.logos?.website?.url) {
          setWebsiteLogo(response.data.data.logos.website.url);
        } else {
          setWebsiteLogo("");
        }
      } catch (error) {
        console.error('Error fetching website logo:', error);
        setWebsiteLogo("");
      } finally {
        setLoading(false);
      }
    };

    if (backendUrl) {
      fetchWebsiteLogo();
    } else {
      setLoading(false);
    }
  }, [backendUrl]);

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    toast.success("Logged out successfully")
    navigate('/login')
    setVisible(false)
  }

  // Close mobile menu when navigating
  const handleMobileNavClick = () => {
    setVisible(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  // Logo display component
  const LogoDisplay = () => {
    if (!loading && websiteLogo) {
      return (
        <img 
          src={websiteLogo} 
          alt="Website Logo" 
          className='w-20 h-auto object-contain transition-all duration-300'
          onError={(e) => {
            e.target.src = assets.logo;
            e.target.className = 'w-20 h-auto object-contain transition-all duration-300';
          }}
        />
      );
    }

    return (
      <img 
        src={assets.logo} 
        className='w-20 h-auto object-contain transition-all duration-300' 
        alt="Logo" 
      />
    );
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/collection', label: 'COLLECTION' },
    { path: '/about', label: 'ABOUT' },
    { path: '/blog', label: 'BLOG' },
    { path: '/contact', label: 'CONTACT' }
  ];

  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <Link to='/' className="flex-shrink-0 z-10">
            <LogoDisplay />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path} 
                className={({ isActive }) => 
                  `relative text-sm font-medium tracking-wide transition-colors duration-200 px-1 py-2 ${
                    isActive 
                      ? 'text-black font-semibold' 
                      : 'text-gray-600 hover:text-black'
                  }`
                }
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-black transition-all duration-300 ${
                  location.pathname === item.path ? 'w-full' : 'w-0'
                }`} />
              </NavLink>
            ))}
          </nav>
          
          {/* Right side icons */}
          <div className='flex items-center gap-4 md:gap-6'>
            {/* Profile dropdown */}
            <div className='hidden sm:block group relative'>
              <div className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                token ? 'hover:bg-gray-100' : ''
              }`}>
                <img 
                  onClick={() => token ? null : navigate('/login')} 
                  src={assets.profile_icon} 
                  className='w-5 h-5 cursor-pointer' 
                  alt="Profile" 
                />
              </div>
              
              {token && (
                <div className='absolute right-0 top-full mt-1 z-20 hidden group-hover:block'>
                  <div className='w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-2'>
                    <div 
                      onClick={() => { navigate('/orders'); }}
                      className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors rounded-t-lg"
                    >
                      My Orders
                    </div>
                    <div 
                      onClick={logout}
                      className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors rounded-b-lg border-t border-gray-100"
                    >
                      Sign Out
                    </div>
                  </div>
                </div>
              )}   
            </div>

            {/* Mobile Profile Icon */}
            <div className='sm:hidden'>
              <img 
                onClick={() => token ? navigate('/orders') : navigate('/login')} 
                src={assets.profile_icon} 
                className='w-5 h-5 cursor-pointer' 
                alt="Profile" 
              />
            </div>

            {/* Cart */}
            <Link 
              to='/cart' 
              className='relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200'
            >
              <img src={assets.cart_icon} className='w-5 h-5' alt="Cart"/>
              {getCartCount() > 0 && (
                <span className='absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium'>
                  {getCartCount() > 99 ? '99+' : getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setVisible(true)}
              className='lg:hidden p-2 rounded-full hover:bg-gray-100 transition-all duration-200'
              aria-label="Open menu"
            >
              <img src={assets.menu_icon} className='w-5 h-5' alt="Menu" />
            </button>
          </div>
        </div>
      </div>
        
      {/* Mobile menu - Modern slide-in */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
        visible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            visible ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setVisible(false)}
        />
        
        {/* Menu Panel */}
        <div className={`absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className='flex h-full flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 p-6'>
              <Link to='/' onClick={handleMobileNavClick}>
                <LogoDisplay />
              </Link>
              <button 
                onClick={() => setVisible(false)}
                className='p-2 rounded-full hover:bg-gray-100 transition-colors'
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto py-6">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path}
                  to={item.path} 
                  onClick={handleMobileNavClick}
                  className={({ isActive }) => 
                    `block px-6 py-4 text-base font-medium transition-colors border-l-4 ${
                      isActive 
                        ? 'text-black bg-gray-50 border-black' 
                        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-black'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile footer */}
            {token && (
              <div className='border-t border-gray-200 p-6'>
                <div className="space-y-2">
                  <button 
                    onClick={() => { navigate('/orders'); handleMobileNavClick(); }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-base"
                  >
                    My Orders
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-base"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Login prompt for non-logged in users */}
            {!token && (
              <div className='border-t border-gray-200 p-6'>
                <button 
                  onClick={() => { navigate('/login'); handleMobileNavClick(); }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-base"
                >
                  Login / Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar