import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowForward } from "react-icons/io";
import { FaWhatsapp, FaTiktok, FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessInfo, setBusinessInfo] = useState({
    socialMedia: {
      facebook: "",
      instagram: "",
      tiktok: "",
      whatsapp: ""
    }
  });
  const sliderRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch business details from backend for social media links
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/business-details`);
        if (response.data.success && response.data.data) {
          setBusinessInfo(response.data.data);
        }
      } catch (error) {
        // Error handling without console output
      }
    }

    if (backendUrl) {
      fetchBusinessDetails();
    }
  }, [backendUrl]);

  // Optimized fetch with caching
  const fetchBanners = useCallback(async () => {
    const cacheKey = 'banners-cache';
    const cacheTimeKey = `${cacheKey}-time`;
    const CACHE_DURATION = 30000;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(cacheTimeKey);

      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
        setBanners(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Cache read failed:', error);
    }

    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${backendUrl}/api/banners/active`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setBanners(data.data);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
          sessionStorage.setItem(cacheTimeKey, Date.now().toString());
        } catch (error) {
          console.warn('Cache write failed:', error);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Banner fetch error:', err);
      setError(err.name === 'AbortError' ? 'Request timeout' : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // Fetch banners on mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle button click to prevent slider interference
  const handleButtonClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Social Media Icons Component - Row layout
  const SocialMediaIconsRow = ({ className = "", iconSize = 20 }) => (
    <div className={`flex items-center gap-4 ${className}`}>
      {[
        { key: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp' },
        { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
        { key: 'facebook', icon: FaFacebookF, label: 'Facebook' },
        { key: 'instagram', icon: FaInstagram, label: 'Instagram' }
      ].map((platform) => {
        const socialUrl = businessInfo.socialMedia?.[platform.key];
        const isActive = !!socialUrl;
        
        return (
          <a
            key={platform.key}
            href={isActive ? socialUrl : "#"}
            target={isActive ? "_blank" : "_self"}
            rel={isActive ? "noopener noreferrer" : ""}
            className={`text-white/80 hover:text-white transition-colors duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded ${
              !isActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={isActive ? `Visit our ${platform.label}` : `${platform.label} link not set`}
            title={isActive ? `Follow us on ${platform.label}` : `${platform.label} link not set`}
            onClick={!isActive ? (e) => e.preventDefault() : undefined}
            tabIndex={0}
          >
            <platform.icon size={iconSize} />
          </a>
        );
      })}
    </div>
  );

  // Social Media Icons Component - Column layout
  const SocialMediaIconsColumn = ({ className = "", iconSize = 20 }) => (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {[
        { key: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp' },
        { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
        { key: 'facebook', icon: FaFacebookF, label: 'Facebook' },
        { key: 'instagram', icon: FaInstagram, label: 'Instagram' }
      ].map((platform) => {
        const socialUrl = businessInfo.socialMedia?.[platform.key];
        const isActive = !!socialUrl;
        
        return (
          <a
            key={platform.key}
            href={isActive ? socialUrl : "#"}
            target={isActive ? "_blank" : "_self"}
            rel={isActive ? "noopener noreferrer" : ""}
            className={`text-white hover:text-white/90 transition-colors duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded ${
              !isActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={isActive ? `Visit our ${platform.label}` : `${platform.label} link not set`}
            title={isActive ? `Follow us on ${platform.label}` : `${platform.label} link not set`}
            onClick={!isActive ? (e) => e.preventDefault() : undefined}
            tabIndex={0}
          >
            <platform.icon size={iconSize} />
          </a>
        );
      })}
    </div>
  );

  // Minimal dots component
  const CustomDots = ({ dots }) => (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <ul className="flex flex-row gap-3 m-0 p-0">
        {dots}
      </ul>
    </div>
  );

  // Professional slider settings with accessibility fixes
  const settings = useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: false,
    arrows: false,
    fade: true,
    lazyLoad: 'progressive',
    cssEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    adaptiveHeight: false,
    touchThreshold: 10,
    swipe: true,
    // Accessibility improvements
    accessibility: true,
    focusOnSelect: false,
    // Remove focus from inactive slides
    waitForAnimate: true,
    appendDots: dots => <CustomDots dots={dots} />,
    customPaging: i => (
      <button 
        className="w-1.5 h-1.5 rounded-full bg-white/40 transition-all duration-300 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label={`Go to slide ${i + 1}`}
      />
    ),
    dotsClass: "slick-dots !flex !flex-row !static !w-auto !m-0 justify-center"
  }), []);

  // Professional Banner Item Component
  const BannerItem = useCallback(({ banner, index, isActive }) => (
    <section 
      className="relative w-full h-full overflow-hidden bg-gray-900"
      // Accessibility attributes
      aria-label={`Slide ${index + 1} of ${banners.length}`}
      role="group"
      aria-roledescription="slide"
    >
      {/* Background Image with smooth loading */}
      <img
        src={banner.imageUrl}
        alt={banner.headingLine1 || "Premium Banner"}
        className="w-full h-screen object-cover transform scale-105 transition-transform duration-10000 ease-out"
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
        width="1920"
        height="1080"
      />

      {/* Black Overlay - Added proper dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-2"></div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-3"></div>

      {/* Content Container - Centered and elegant */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center px-6 max-w-8xl">
          
          {/* Main Headline - Clean and professional */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase mb-6">
            {banner.headingLine1}
            {banner.headingLine2 && (
              <>
                {" "}
                <span className="font-bold">{banner.headingLine2}</span>
              </>
            )}
          </h1>
        
          {/* Subtext - Minimal and elegant */}
          {banner.subtext && (
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed mb-10">
              {banner.subtext}
            </p>
          )}

          {/* CTA Button - Premium style */}
          {banner.buttonText && banner.redirectUrl && (
            <div className="relative z-30">
              <Link
                to={banner.redirectUrl}
                onClick={handleButtonClick}
                className="inline-flex items-center gap-3 px-8 py-4 text-white border border-white/50 rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-white/80 hover:gap-4 group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label={`${banner.buttonText} - ${banner.headingLine1}`}
                // Prevent focus on inactive slides
                tabIndex={isActive ? 0 : -1}
              >
                <span className="text-sm font-medium tracking-wider uppercase">{banner.buttonText}</span>
                <span className="inline-flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <IoIosArrowForward size={16} />
                </span>
              </Link>
            </div>
          )}

          {/* Social Media Icons - Mobile Only (below button in row) */}
          <div className="mt-8 md:hidden flex justify-center">
            <SocialMediaIconsRow iconSize={24} />
          </div>
        </div>
      </div>

      {/* Social Media Icons - Desktop Only (left bottom in column) */}
      <div className="text-white absolute bottom-8 left-8 z-10 hidden md:flex flex-col gap-4">
        <SocialMediaIconsColumn iconSize={20} />
      </div>

      {/* Slide counter - Current slide / Total slides */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="text-white/80 text-lg font-light tracking-wide">
          {(index + 1).toString().padStart(2, '0')} / {banners.length.toString().padStart(2, '0')}
        </div>
      </div>
    </section>
  ), [handleButtonClick, banners.length, businessInfo.socialMedia]);

  // Custom slider to handle accessibility
  const renderSlider = () => {
    if (banners.length === 0) return null;

    return (
      <Slider ref={sliderRef} {...settings}>
        {banners.map((banner, index) => (
          <div key={banner._id || banner.imageUrl}>
            <BannerItem 
              banner={banner} 
              index={index} 
              isActive={true} // In a real implementation, you'd track active slide
            />
          </div>
        ))}
      </Slider>
    );
  };

  // Premium loading skeleton
  if (loading) {
    return (
      <section 
        className="relative w-full h-screen overflow-hidden bg-gray-900"
        aria-label="Loading banners"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"></div>
        <div className="absolute inset-0 bg-black/40 z-2"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-3"></div>
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center px-6 max-w-4xl">
            <div className="h-20 bg-white/10 animate-pulse rounded mb-6 w-96 mx-auto"></div>
            <div className="h-4 bg-white/10 animate-pulse rounded mb-2 w-80 mx-auto"></div>
            <div className="h-4 bg-white/10 animate-pulse rounded mb-2 w-72 mx-auto"></div>
            <div className="h-12 bg-white/10 animate-pulse rounded w-40 mx-auto mt-10"></div>
            
            {/* Social Media Icons Skeleton - Mobile (row) */}
            <div className="mt-8 md:hidden flex justify-center gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-6 h-6 bg-white/20 animate-pulse rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media Icons Skeleton - Desktop (column) */}
        <div className="absolute bottom-8 left-8 z-10 hidden md:flex flex-col gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-5 h-5 bg-white/20 animate-pulse rounded-full"></div>
          ))}
        </div>

        {/* Loading state slide counter */}
        <div className="absolute bottom-8 right-8 z-10">
          <div className="text-white/60 text-lg font-light tracking-wide">
            01 / 00
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section 
        className="relative w-full h-screen overflow-hidden bg-gray-900"
        aria-label="Error loading banners"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-black/40 z-2"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-6">
          <div>
            <p className="text-xl mb-6 font-light">{error}</p>
            <button
              onClick={fetchBanners}
              className="px-8 py-3 text-base font-medium text-gray-900 bg-white rounded-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Retry loading banners"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (banners.length === 0) {
    return (
      <section 
        className="relative w-full h-screen overflow-hidden bg-gray-900"
        aria-label="No banners available"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-black/40 z-2"></div>
        <div className="h-full flex items-center justify-center text-center text-white/60 px-6">
          <div>
            <p className="text-xl font-light mb-4">No banners available</p>
            <button
              onClick={fetchBanners}
              className="px-6 py-2 text-white border border-white/30 rounded-sm hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden" 
      aria-label="Featured banners"
      role="region"
      aria-roledescription="carousel"
    >
      {/* Global styles for active dot state */}
      <style>{`
        .slick-dots li.slick-active button {
          background: white !important;
          transform: scale(1.3);
        }
        
        /* Hide inactive slides from focus */
        .slick-slide[aria-hidden="true"] * {
          visibility: hidden;
        }
      `}</style>
      
      {renderSlider()}
    </div>
  );
};

export default Hero;