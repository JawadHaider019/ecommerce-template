import React, { useEffect, useState } from 'react';
import axios from "axios";
import { assets } from '../assets/assets'; // Import your assets

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Cache for favicon to prevent refetching
let faviconCache = {
  url: '',
  timestamp: 0,
  cacheTime: 5 * 60 * 1000 // 5 minutes
};

const Favicon = () => {
  const [favicon, setFavicon] = useState('');

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        // Check cache first
        const now = Date.now();
        if (faviconCache.url && now - faviconCache.timestamp < faviconCache.cacheTime) {
          setFavicon(faviconCache.url);
          updateDocumentFavicon(faviconCache.url);
          return;
        }

        const response = await axios.get(`${backendUrl}/api/business-details`, {
          timeout: 3000 // 3 second timeout
        });
        
        if (response.data.success && response.data.data?.logos?.favicon?.url) {
          const faviconUrl = response.data.data.logos.favicon.url;
          
          // Update cache
          faviconCache = {
            url: faviconUrl,
            timestamp: now,
            cacheTime: 5 * 60 * 1000
          };
          
          setFavicon(faviconUrl);
          updateDocumentFavicon(faviconUrl);
        } else {
          // ✅ Fallback to assets logo if no favicon from API
          console.log('📝 No favicon from API, using assets logo as fallback');
          useAssetsLogoFallback();
        }
      } catch (error) {
        console.error('❌ Error fetching favicon, using assets logo as fallback:', error);
        // ✅ Fallback to assets logo on error
        useAssetsLogoFallback();
      }
    };

    if (backendUrl) {
      fetchFavicon();
    } else {
      // ✅ Fallback if no backend URL
      console.log('📝 No backend URL, using assets logo as fallback');
      useAssetsLogoFallback();
    }
  }, []);

  const useAssetsLogoFallback = () => {
    if (assets.logo) {
      console.log('✅ Using assets logo as favicon:', assets.logo);
      updateDocumentFavicon(assets.logo);
    } else {
      // Ultimate fallback - use default favicon paths
      console.log('📝 No assets logo found, using default favicon');
      setDefaultFavicons();
    }
  };

  const setDefaultFavicons = () => {
    try {
      // Remove existing favicons
      const existingLinks = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
      existingLinks.forEach(link => link.remove());
      
      // Set default favicon paths that exist in public folder
      const defaultFavicons = [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ];

      defaultFavicons.forEach(fav => {
        const link = document.createElement('link');
        Object.keys(fav).forEach(key => {
          link[key] = fav[key];
        });
        document.head.appendChild(link);
      });

      console.log('📝 Using default favicon paths');
    } catch (error) {
      console.error('❌ Error setting default favicons:', error);
    }
  };

  const updateDocumentFavicon = (faviconUrl) => {
    if (faviconUrl) {
      try {
        // Remove existing favicons
        const existingLinks = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
        existingLinks.forEach(link => link.remove());
        
        // Create multiple favicon sizes for better compatibility
        const faviconSizes = [
          { rel: 'icon', type: 'image/x-icon', href: faviconUrl },
          { rel: 'icon', type: 'image/png', sizes: '32x32', href: faviconUrl },
          { rel: 'icon', type: 'image/png', sizes: '16x16', href: faviconUrl },
          { rel: 'apple-touch-icon', sizes: '180x180', href: faviconUrl },
          { rel: 'icon', type: 'image/png', sizes: '192x192', href: faviconUrl } // For Android
        ];

        faviconSizes.forEach(fav => {
          const link = document.createElement('link');
          Object.keys(fav).forEach(key => {
            link.setAttribute(key, fav[key]);
          });
          document.head.appendChild(link);
        });

        console.log('✅ Favicon updated successfully:', faviconUrl);
      } catch (error) {
        console.error('❌ Error updating favicon in DOM:', error);
        // Final fallback to default favicons
        setDefaultFavicons();
      }
    } else {
      // If no URL provided, use assets logo fallback
      console.log('📝 No favicon URL provided, using assets logo fallback');
      useAssetsLogoFallback();
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default Favicon;