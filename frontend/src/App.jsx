import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Product from './pages/Product'
import Deal from './pages/Deal';
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import FaqBot from './components/FaqBot'
import { ToastContainer } from 'react-toastify'
import Footer from './components/Footer'
import 'react-toastify/dist/ReactToastify.css'
import Favicon from './components/Favicon' 
import { assets } from './assets/assets'

// ✅ SEO Configuration
const SEO_CONFIG = {
  home: {
    title: "Pure Clay - Pakistan's Leading Organic Foods Brand | Olive Oil & Natural Products",
    description: "Pakistan's No. 1 organic brand for premium olive oil, peanuts, dates & natural foods. 100% pure, chemical-free products trusted nationwide.",
    keywords: "organic olive oil pakistan, pure clay foods, natural foods pakistan, dates, peanuts, chemical-free products",
    canonical: "https://pureclay.org",
    ogImage: assets.logo // Use your actual OG image
  },
  collection: {
    title: "Organic Products Collection - Pure Clay | Premium Olive Oil, Dates & Peanuts",
    description: "Browse Pure Clay's complete collection of organic products - extra virgin olive oil, fresh dates, roasted peanuts. 100% natural & chemical-free.",
    keywords: "organic products pakistan, olive oil collection, dates collection, peanuts, natural foods",
    canonical: "https://pureclay.org/collection"
  },
  about: {
    title: "About Pure Clay - Pakistan's Trusted Organic Brand Since 2010",
    description: "Learn about Pure Clay's commitment to providing 100% pure, organic foods to Pakistani families. Our story, mission, and quality standards.",
    keywords: "about pure clay, organic brand pakistan, company story, quality standards",
    canonical: "https://pureclay.org/about"
  },
  contact: {
    title: "Contact Pure Clay - Customer Service & Support",
    description: "Get in touch with Pure Clay for customer support, wholesale inquiries, or any questions about our organic products.",
    keywords: "contact pure clay, customer support, wholesale inquiry, organic products pakistan",
    canonical: "https://pureclay.org/contact"
  },
  blog: {
    title: "Organic Lifestyle Blog - Pure Clay | Health Tips & Recipes",
    description: "Discover healthy recipes, organic lifestyle tips, and nutritional insights from Pure Clay's blog. Learn about the benefits of organic foods.",
    keywords: "organic blog, health tips, recipes, nutritional insights, pure clay blog",
    canonical: "https://pureclay.org/blog"
  },
  login: {
    title: "Login - Pure Clay | Your Account",
    description: "Login to your Pure Clay account to track orders, save favorites, and manage your profile.",
    keywords: "login pure clay, account, track orders, profile",
    canonical: "https://pureclay.org/login"
  },
  cart: {
    title: "Shopping Cart - Pure Clay | Your Organic Products",
    description: "Review your selected organic products in the Pure Clay shopping cart. Proceed to checkout for delivery across Pakistan.",
    keywords: "shopping cart, organic products cart, checkout pure clay",
    canonical: "https://pureclay.org/cart"
  },
  orders: {
    title: "My Orders - Pure Clay | Order History & Tracking",
    description: "View your order history, track current orders, and manage your purchases with Pure Clay's order management system.",
    keywords: "my orders, order history, track orders, purchase history",
    canonical: "https://pureclay.org/orders"
  }
}

const App = () => {
  const location = useLocation()

  // ✅ Get SEO data based on current route
  const getSEOData = () => {
    const path = location.pathname
    
    if (path.includes('/product/') || path.includes('/deal/')) {
      // These will be handled by their respective components
      return SEO_CONFIG.home
    }
    
    if (path.includes('/collection')) return SEO_CONFIG.collection
    if (path.includes('/about')) return SEO_CONFIG.about
    if (path.includes('/contact')) return SEO_CONFIG.contact
    if (path.includes('/blog')) return SEO_CONFIG.blog
    if (path.includes('/login')) return SEO_CONFIG.login
    if (path.includes('/cart')) return SEO_CONFIG.cart
    if (path.includes('/orders')) return SEO_CONFIG.orders
    if (path.includes('/place-order')) return SEO_CONFIG.cart
    
    return SEO_CONFIG.home
  }

  const seoData = getSEOData()

  // ✅ Structured Data for Organization
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pure Clay",
    "url": "https://pureclay.org",
    "logo": "https://pureclay.org/images/logo.png",
    "description": "Pakistan's leading organic brand for premium olive oil, peanuts, dates and natural foods",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Urdu"]
    },
    "sameAs": []
  }

  return (
    <div className="px-4">
      {/* ✅ SEO Head with Helmet */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href={seoData.canonical} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Pure Clay" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.ogImage} />
        
        {/* Additional Important Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Pure Clay" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="PK" />
        <meta name="geo.placename" content="Pakistan" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

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

      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/collection' element={<Collection/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/product/:productId' element={<Product/>}/>
        <Route path="/deal/:dealId" element={<Deal />} />
        <Route path="/collection/product/:productId" element={<Product />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/blog' element={<Blog/>}/>
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path='/orders' element={<Orders/>}/>
        <Route path='/place-order' element={<PlaceOrder/>}/>
      </Routes>
      <Footer/>
      <FaqBot />
    </div>
  )
}

export default App