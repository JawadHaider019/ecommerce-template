import Clarity from "@microsoft/clarity";
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Deal from './pages/Deal';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import PlaceOrder from './pages/PlaceOrder';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import FaqBot from './components/FaqBot';
import { ToastContainer } from 'react-toastify';
import Footer from './components/Footer';
import 'react-toastify/dist/ReactToastify.css';
import Favicon from './components/Favicon';
import { assets } from './assets/assets';

// Logo Component for SEO
const LogoSEO = () => {
  return (
    <div style={{
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      width: '112px',
      height: '112px'
    }}>
      <img
        src={assets.logo}
        alt="Pure Clay - Pakistan's Organic Foods Brand"
        width="112"
        height="112"
      />
    </div>
  );
};

const App = () => {
  const location = useLocation();

  // Initialize Clarity once
  useEffect(() => {
    Clarity.init("vlucuvw2el");
  }, []);

  // Track route changes (important for SPA)
  useEffect(() => {
    Clarity.event("page_view", {
      path: location.pathname
    });
  }, [location]);

  return (
    <div className="px-4">
      <Favicon />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{
          '--toastify-color-success': '#000000',
          '--toastify-text-color-success': '#ffffff',
          '--toastify-color-error': '#dc2626',
          '--toastify-text-color-error': '#ffffff',
          '--toastify-color-progress-success': '#10b981',
          '--toastify-color-progress-error': '#fca5a5',
        }}
        toastStyle={{
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '8px',
        }}
      />

      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path="/deal/:dealId" element={<Deal />} />
        <Route path="/collection/product/:productId" element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/blog' element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/images/logo.png' element={<LogoSEO />} />
      </Routes>

      <Footer />
      <FaqBot />
    </div>
  );
};

export default App;