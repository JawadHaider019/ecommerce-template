import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

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
  const clarityInitialized = useRef(false);
  const projectId = "vlucuvw2el";

  // Initialize Clarity with anti-blocking measures
  useEffect(() => {
    // Don't run in development
    if (import.meta.env.DEV) return;
    
    // Prevent double initialization
    if (clarityInitialized.current) return;

    const initClarity = () => {
      try {
        // Method 1: Try standard initialization first
        if (typeof window.clarity === 'undefined') {
          // Multiple domain fallbacks
          const domains = [
            `https://www.clarity.ms/tag/${projectId}`,
            `https://clarity.ms/tag/${projectId}`,
            `https://c.ms/tag/${projectId}`,
            `https://analytics.clarity.ms/tag/${projectId}`
          ];

          let currentDomain = 0;

          const loadScript = () => {
            if (currentDomain >= domains.length) {
              // If all domains fail, try the beacon method
              loadBeacon();
              return;
            }

            const script = document.createElement('script');
            script.src = `${domains[currentDomain]}?ref=${Math.random().toString(36).substring(7)}`;
            script.async = true;
            script.setAttribute('data-clarity', projectId);
            
            script.onload = () => {
              clarityInitialized.current = true;
              console.log('Clarity loaded successfully');
              
              // Send initial page view
              if (window.clarity) {
                window.clarity('set', 'page', location.pathname);
              }
            };
            
            script.onerror = () => {
              currentDomain++;
              loadScript(); // Try next domain
            };
            
            document.head.appendChild(script);
          };

          loadScript();
        }
      } catch (error) {
        // Silent fail - fallback to beacon method
        loadBeacon();
      }
    };

    // Fallback beacon method (harder to block)
    const loadBeacon = () => {
      try {
        // Method 2: Image beacon
        const img = new Image();
        img.src = `https://clarity.ms/tag/${projectId}?t=${Date.now()}`;
        img.style.display = 'none';
        img.onload = () => {
          clarityInitialized.current = true;
        };
        document.body.appendChild(img);

        // Method 3: Iframe fallback
        setTimeout(() => {
          if (!clarityInitialized.current) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://clarity.ms/tag/${projectId}`;
            iframe.style.display = 'none';
            iframe.onload = () => {
              clarityInitialized.current = true;
            };
            document.body.appendChild(iframe);
          }
        }, 1000);
      } catch (e) {
        // Complete silent fail - don't break the app
      }
    };

    // Method 4: Web Worker (most stealthy)
    const initWorker = () => {
      try {
        if (window.Worker) {
          const workerCode = `
            self.addEventListener('message', (e) => {
              if (e.data === 'init') {
                try {
                  importScripts('https://www.clarity.ms/tag/${projectId}');
                } catch (e) {}
              }
            });
          `;
          
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(blob);
          const worker = new Worker(workerUrl);
          
          setTimeout(() => {
            worker.postMessage('init');
          }, 2000);
          
          // Clean up
          setTimeout(() => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
          }, 10000);
        }
      } catch (e) {}
    };

    // Delay initialization to bypass some ad blockers
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    const timer1 = setTimeout(initClarity, delay);
    
    // Try worker method after longer delay
    const timer2 = setTimeout(initWorker, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, projectId]);

  // Track route changes with fallbacks
  useEffect(() => {
    if (import.meta.env.DEV) return;

    const trackPageView = () => {
      try {
        // Try all possible tracking methods
        if (window.clarity && typeof window.clarity === 'function') {
          window.clarity('set', 'page', location.pathname);
          window.clarity('event', 'page_view');
        } else if (clarityInitialized.current) {
          // If clarity is initialized but not available, try re-initializing
          const script = document.createElement('script');
          script.src = `https://clarity.ms/tag/${projectId}?t=${Date.now()}`;
          script.async = true;
          document.head.appendChild(script);
        }
      } catch (error) {
        // Silent fail
      }
    };

    // Debounce tracking to prevent multiple rapid events
    const timeoutId = setTimeout(trackPageView, 100);
    return () => clearTimeout(timeoutId);
  }, [location.pathname, projectId]);

  // DNS Prefetch for Clarity domains
  useEffect(() => {
    const domains = [
      'clarity.ms',
      'www.clarity.ms',
      'c.ms'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);

      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = `https://${domain}`;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    });
  }, []);

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