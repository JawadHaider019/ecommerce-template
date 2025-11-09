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
  const [currentSlide, setCurrentSlide] = useState(0);

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
            className={`text-white/80 hover:text-white transition-colors duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-full ${
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
            className={`text-white hover:text-white/90 transition-colors duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-full ${
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

  // Custom Dots Component - Translated to bottom of header
  const CustomDots = () => {
    if (banners.length <= 1) return null;

    return (
      <div className="absolute -bottom-10 md:-bottom-16 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => sliderRef.current?.slickGoTo(index)}
              className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-full transition-all duration-300"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div 
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide 
                    ? 'bg-black w-8 h-2' 
                    : 'bg-black/40 w-2 h-2 hover:bg-black/60'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Professional slider settings with accessibility fixes
  const settings = useMemo(() => ({
    dots: false, // Disable default dots since we're using custom ones
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
    beforeChange: (_, next) => setCurrentSlide(next),
  }), []);

  // Professional Banner Item Component
  const BannerItem = useCallback(({ banner, index, isActive }) => (
    <section 
      className="relative w-full h-full"
      // Accessibility attributes
      aria-label={`Slide ${index + 1} of ${banners.length}`}
      role="group"
      aria-roledescription="slide"
    >
      {/* Background Image with smooth loading and rounded corners */}
      <div className="w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl mx-auto overflow-hidden">
        <img
          src={banner.imageUrl}
          alt={banner.headingLine1 || "Premium Banner"}
          className="w-full h-full object-cover transform scale-105 transition-transform duration-10000 ease-out"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          width="1920"
          height="1080"
        />
      </div>

      {/* Full Coverage Black Overlay */}
      <div className="absolute inset-0 bg-black/50 z-2 w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl"></div>

      {/* Full Coverage Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-3 w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl"></div>

      {/* Content Container - Mobile Responsive */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center px-4 md:px-6 max-w-7xl md:max-w-8xl">
          
          {/* Main Headline - Mobile Responsive */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase mb-4 md:mb-6">
            {banner.headingLine1}
            {banner.headingLine2 && (
              <>
                {" "}
                <span className="font-bold">{banner.headingLine2}</span>
              </>
            )}
          </h1>
        
          {/* Subtext - Mobile Responsive */}
          {banner.subtext && (
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-xs sm:max-w-sm md:max-w-2xl mx-auto leading-relaxed mb-6 md:mb-10 px-2">
              {banner.subtext}
            </p>
          )}

          {/* CTA Button - Mobile Responsive */}
          {banner.buttonText && banner.redirectUrl && (
            <div className="relative z-30">
              <Link
                to={banner.redirectUrl}
                onClick={handleButtonClick}
                className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 text-white border border-white/50 rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/80 hover:gap-3 md:hover:gap-4 group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label={`${banner.buttonText} - ${banner.headingLine1}`}
                // Prevent focus on inactive slides
                tabIndex={isActive ? 0 : -1}
              >
                <span className="text-xs md:text-sm font-medium tracking-wider uppercase">{banner.buttonText}</span>
                <span className="inline-flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <IoIosArrowForward size={14} md:size={16} />
                </span>
              </Link>
            </div>
          )}

          {/* Social Media Icons - Mobile Only (below button in row) */}
          <div className="mt-6 md:mt-8 md:hidden flex justify-center">
            <SocialMediaIconsRow iconSize={20} />
          </div>
        </div>
      </div>

      {/* Social Media Icons - Desktop Only (left bottom in column) */}
      <div className="text-white absolute bottom-4 md:bottom-8 left-4 md:left-12 z-10 hidden md:flex flex-col gap-3 md:gap-4">
        <SocialMediaIconsColumn iconSize={18} md:iconSize={20} />
      </div>

      {/* Slide counter - Mobile Responsive */}
      <div className="text-white absolute bottom-4 md:bottom-8 right-4 md:right-12 z-10">
        <div className="text-white/80 text-sm md:text-lg font-light tracking-wide">
          {(index + 1).toString().padStart(2, '0')} / {banners.length.toString().padStart(2, '0')}
        </div>
      </div>
    </section>
  ), [handleButtonClick, banners.length, businessInfo.socialMedia]);

  // Custom slider to handle accessibility
  const renderSlider = () => {
    if (banners.length === 0) return null;

    return (
      <div className="transform -translate-y-9 md:-translate-y-[2.7rem] relative">
        <Slider ref={sliderRef} {...settings}>
          {banners.map((banner, index) => (
            <div key={banner._id || banner.imageUrl} className="px-2">
              <BannerItem 
                banner={banner} 
                index={index} 
                isActive={true}
              />
            </div>
          ))}
        </Slider>
        {/* Custom Dots - Positioned at bottom of translated header */}
        <CustomDots />
      </div>
    );
  };

  // Premium loading skeleton - Mobile Responsive
  if (loading) {
    return (
      <section 
        className="relative w-full h-[100vh] md:h-screen transform -translate-y-9 md:-translate-y-[2.7rem]"
        aria-label="Loading banners"
      >
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse overflow-hidden">
            {/* Full Coverage Overlays */}
            <div className="absolute inset-0 bg-black/40 z-2 w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-3 w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl"></div>
            
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="text-center px-4 md:px-6 max-w-7xl md:max-w-8xl">
                <div className="h-16 md:h-20 bg-white/10 animate-pulse rounded-full mb-4 md:mb-6 w-64 md:w-96 mx-auto"></div>
                <div className="h-3 md:h-4 bg-white/10 animate-pulse rounded-full mb-2 w-48 md:w-80 mx-auto"></div>
                <div className="h-3 md:h-4 bg-white/10 animate-pulse rounded-full mb-2 w-40 md:w-72 mx-auto"></div>
                <div className="h-10 md:h-12 bg-white/10 animate-pulse rounded-full w-32 md:w-40 mx-auto mt-6 md:mt-10"></div>
                
                {/* Social Media Icons Skeleton - Mobile (row) */}
                <div className="mt-6 md:mt-8 md:hidden flex justify-center gap-3 md:gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-5 h-5 md:w-6 md:h-6 bg-white/20 animate-pulse rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Media Icons Skeleton - Desktop (column) */}
            <div className="absolute bottom-4 md:bottom-8 left-4 md:left-12 z-10 hidden md:flex flex-col gap-3 md:gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-4 h-4 md:w-5 md:h-5 bg-white/20 animate-pulse rounded-full"></div>
              ))}
            </div>

            {/* Loading state slide counter */}
            <div className="absolute bottom-4 md:bottom-8 right-4 md:right-12 z-10">
              <div className="text-white/60 text-sm md:text-lg font-light tracking-wide">
                01 / 00
              </div>
            </div>

            {/* Loading state dots skeleton - Positioned at bottom of translated header */}
            <div className="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex items-center gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-white/20 animate-pulse rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state - Mobile Responsive
  if (error) {
    return (
      <section 
        className="relative w-full h-[100vh] md:h-screen transform -translate-y-9 md:-translate-y-[2.7rem]"
        aria-label="Error loading banners"
      >
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
            {/* Full Coverage Overlay */}
            <div className="absolute inset-0 bg-black/40 z-2 w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl"></div>
            
            <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4 md:px-6">
              <div>
                <p className="text-lg md:text-xl mb-4 md:mb-6 font-light">{error}</p>
                <button
                  onClick={fetchBanners}
                  className="px-6 md:px-8 py-2 md:py-3 text-sm md:text-base font-medium text-gray-900 bg-white rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Retry loading banners"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state - Mobile Responsive
  if (banners.length === 0) {
    return (
      <section 
        className="relative w-full h-[100vh] md:h-screen transform -translate-y-9 md:-translate-y-[2.7rem]"
        aria-label="No banners available"
      >
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
            {/* Full Coverage Overlay */}
            <div className="absolute inset-0 bg-black/40 z-2 w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl"></div>
            
            <div className="h-full flex items-center justify-center text-center text-white/60 px-4 md:px-6">
              <div>
                <p className="text-lg md:text-xl font-light mb-3 md:mb-4">No banners available</p>
                <button
                  onClick={fetchBanners}
                  className="px-4 md:px-6 py-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div 
      className="relative w-full transform -translate-y-9 md:-translate-y-[2.7rem]" 
      aria-label="Featured banners"
      role="region"
      aria-roledescription="carousel"
    >
      {/* Global styles for active dot state */}
      <style>{`
        /* Hide inactive slides from focus */
        .slick-slide[aria-hidden="true"] * {
          visibility: hidden;
        }

        /* Ensure rounded corners are maintained */
        .slick-slide > div {
          border-radius: 1.5rem;
        }

        .slick-list {
          border-radius: 1.5rem;
        }
      `}</style>
      
      {renderSlider()}
    </div>
  );
};

export default Hero;