import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowForward } from "react-icons/io";
import { FaWhatsapp, FaTiktok, FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { assets } from "../assets/assets";  

// Cache with TTL
const createCache = (duration = 5 * 60 * 1000) => ({
  data: null,
  timestamp: 0,
  duration
});

const bannerCache = createCache(5 * 60 * 1000);
const businessCache = createCache(10 * 60 * 1000);

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const loadedImagesRef = useRef(new Set());
  const fetchControllerRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, []);

  // Initialize with cache synchronously
  useEffect(() => {
    const now = Date.now();
    
    if (bannerCache.data && now - bannerCache.timestamp < bannerCache.duration) {
      setBanners(bannerCache.data);
      setLoading(false);
    }
    
    if (businessCache.data && now - businessCache.timestamp < businessCache.duration) {
      setBusinessInfo(businessCache.data);
    }
  }, []);

  // Fetch business details (lower priority)
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      const now = Date.now();
      if (businessCache.data && now - businessCache.timestamp < businessCache.duration) {
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/business-details`, {
          signal: AbortSignal.timeout(3000),
          priority: 'low'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            businessCache.data = data.data;
            businessCache.timestamp = Date.now();
            setBusinessInfo(data.data);
          }
        }
      } catch (error) {
        // Silently fail
      }
    };

    if (backendUrl) {
      // Defer business details fetch
      setTimeout(fetchBusinessDetails, 1000);
    }
  }, [backendUrl]);

  // Fetch banners (higher priority)
  useEffect(() => {
    const fetchBanners = async () => {
      const now = Date.now();
      if (bannerCache.data && now - bannerCache.timestamp < bannerCache.duration) {
        return;
      }

      setLoading(true);

      try {
        if (fetchControllerRef.current) {
          fetchControllerRef.current.abort();
        }
        
        fetchControllerRef.current = new AbortController();
        
        const response = await fetch(`${backendUrl}/api/banners/active`, {
          signal: fetchControllerRef.current.signal,
          priority: 'high'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Preload first image
          if (data.data[0]?.imageUrl) {
            const img = new Image();
            img.src = data.data[0].imageUrl;
            img.decode().catch(() => {});
          }

          bannerCache.data = data.data;
          bannerCache.timestamp = Date.now();
          setBanners(data.data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setBanners([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (backendUrl) {
      fetchBanners();
    } else {
      setLoading(false);
    }
  }, [backendUrl]);

  // Social media platforms configuration
  const socialPlatforms = useMemo(() => [
    { key: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp' },
    { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
    { key: 'facebook', icon: FaFacebookF, label: 'Facebook' },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram' }
  ], []);

  // Memoized Social Media Icons
  const SocialMediaIcons = useMemo(() => {
    const Row = ({ className = "", iconSize = 20 }) => {
      const socialMedia = businessInfo.socialMedia;
      
      return (
        <div className={`flex items-center gap-4 ${className}`}>
          {socialPlatforms.map((platform) => {
            const socialUrl = socialMedia?.[platform.key];
            const isActive = !!socialUrl;
            
            const Icon = platform.icon;
            
            return (
              <a
                key={platform.key}
                href={isActive ? socialUrl : "#"}
                target={isActive ? "_blank" : "_self"}
                rel={isActive ? "noopener noreferrer" : ""}
                className={`text-white/80 hover:text-white transition-colors duration-300 transform hover:scale-110 ${
                  !isActive ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label={isActive ? `Visit our ${platform.label}` : `${platform.label} link not set`}
                onClick={!isActive ? (e) => e.preventDefault() : undefined}
              >
                <Icon size={iconSize} />
              </a>
            );
          })}
        </div>
      );
    };

    const Column = ({ className = "", iconSize = 20 }) => {
      const socialMedia = businessInfo.socialMedia;
      
      return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
          {socialPlatforms.map((platform) => {
            const socialUrl = socialMedia?.[platform.key];
            const isActive = !!socialUrl;
            
            const Icon = platform.icon;
            
            return (
              <a
                key={platform.key}
                href={isActive ? socialUrl : "#"}
                target={isActive ? "_blank" : "_self"}
                rel={isActive ? "noopener noreferrer" : ""}
                className={`text-white hover:text-white/90 transition-colors duration-300 transform hover:scale-110 ${
                  !isActive ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label={isActive ? `Visit our ${platform.label}` : `${platform.label} link not set`}
                onClick={!isActive ? (e) => e.preventDefault() : undefined}
              >
                <Icon size={iconSize} />
              </a>
            );
          })}
        </div>
      );
    };

    return { Row, Column };
  }, [businessInfo.socialMedia, socialPlatforms]);

  // Custom Dots Component
  const CustomDots = useCallback(() => {
    if (banners.length <= 1) return null;

    return (
      <div className="absolute -bottom-10 md:-bottom-16 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => sliderRef.current?.slickGoTo(index)}
              className="focus:outline-none transition-all duration-300"
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
  }, [banners.length, currentSlide]);

  // Slider settings
  const sliderSettings = useMemo(() => ({
    dots: false,
    infinite: banners.length > 1,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 6000,
    pauseOnHover: false,
    arrows: false,
    fade: true,
    lazyLoad: 'progressive',
    cssEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    adaptiveHeight: false,
    touchThreshold: 10,
    swipe: banners.length > 1,
    accessibility: true,
    waitForAnimate: true,
    beforeChange: (_, next) => setCurrentSlide(next),
  }), [banners.length]);

  // Optimized Banner Image Component
  const BannerImage = useCallback(({ banner, index }) => {
    const isLoaded = loadedImagesRef.current.has(banner.imageUrl);
    
    useEffect(() => {
      if (!isLoaded && index < 2) {
        const img = new Image();
        img.src = banner.imageUrl;
        img.onload = img.onerror = () => {
          loadedImagesRef.current.add(banner.imageUrl);
        };
      }
    }, [banner.imageUrl, index, isLoaded]);

    return (
      <>
        <img
          src={banner.imageUrl}
          alt={banner.headingLine1 || "Premium Banner"}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={index === 0 ? "eager" : "lazy"}
          decoding={index === 0 ? "sync" : "async"}
          width={1920}
          height={1080}
          onLoad={() => loadedImagesRef.current.add(banner.imageUrl)}
          onError={() => loadedImagesRef.current.add(banner.imageUrl)}
        />
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
        )}
      </>
    );
  }, []);

  // Banner Item Component
  const BannerItem = useCallback(({ banner, index }) => {
    const handleButtonClick = useCallback((e) => {
      e.stopPropagation();
    }, []);

    return (
      <section className="relative w-full h-full">
        {/* Background Image Container */}
        <div className="w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl mx-auto overflow-hidden">
          <BannerImage banner={banner} index={index} />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/30 z-2 rounded-3xl md:rounded-4xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-3 rounded-3xl md:rounded-4xl"></div>

        {/* Content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center px-4 md:px-6 max-w-7xl md:max-w-8xl">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase mb-4 md:mb-6">
              {banner.headingLine1}
              {banner.headingLine2 && (
                <> <span className="font-bold">{banner.headingLine2}</span></>
              )}
            </h1>
          
            {/* Subtext */}
            {banner.subtext && (
              <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-xs sm:max-w-sm md:max-w-2xl mx-auto leading-relaxed mb-6 md:mb-10 px-2">
                {banner.subtext}
              </p>
            )}

            {/* CTA Button */}
            {banner.buttonText && banner.redirectUrl && (
              <div className="relative z-30">
                <Link
                  to={banner.redirectUrl}
                  onClick={handleButtonClick}
                  className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 text-white border border-white/50 rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/80 group"
                  aria-label={banner.buttonText}
                >
                  <span className="text-xs md:text-sm font-medium tracking-wider uppercase">
                    {banner.buttonText}
                  </span>
                  <IoIosArrowForward size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}

            {/* Mobile Social Media */}
            <div className="mt-6 md:mt-8 md:hidden flex justify-center">
              <SocialMediaIcons.Row iconSize={20} />
            </div>
          </div>
        </div>

        {/* Desktop Social Media */}
        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-12 z-10 hidden md:flex flex-col gap-3 md:gap-4">
          <SocialMediaIcons.Column iconSize={18} />
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-12 z-10">
          <div className="text-white/80 text-sm md:text-lg font-light tracking-wide">
            {(index + 1).toString().padStart(2, '0')} / {banners.length.toString().padStart(2, '0')}
          </div>
        </div>
      </section>
    );
  }, [SocialMediaIcons]);

  // Fallback banner content
  const fallbackBanners = useMemo(() => [{
    _id: 'fallback',
    imageUrl: assets.hero_img,
    headingLine1: 'Premium',
    headingLine2: 'Experience',
    subtext: 'Discover our exclusive collection and services',
    buttonText: 'Explore Now',
    redirectUrl: '/collection'
  }], []);

  // Loading skeleton
  if (loading) {
    return (
      <section className="relative w-full h-[100vh] md:h-screen transform -translate-y-9 md:-translate-y-[2.7rem]">
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full h-[100vh] md:h-screen rounded-3xl md:rounded-4xl bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-2 rounded-3xl md:rounded-4xl"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-3 rounded-3xl md:rounded-4xl"></div>
            
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="text-center px-4 md:px-6 max-w-7xl md:max-w-8xl">
                <div className="h-16 md:h-20 bg-white/10 animate-pulse rounded-full mb-4 md:mb-6 w-64 md:w-96 mx-auto"></div>
                <div className="h-10 md:h-12 bg-white/10 animate-pulse rounded-full w-32 md:w-40 mx-auto mt-6 md:mt-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Main render
  const bannersToShow = banners.length > 0 ? banners : fallbackBanners;

  return (
    <div className="relative w-full transform -translate-y-9 md:-translate-y-[2.7rem]">
      <style>{`
        .slick-slide > div {
          border-radius: 1.5rem;
        }
        .slick-list {
          border-radius: 1.5rem;
        }
      `}</style>
      
      <div className="transform -translate-y-9 md:-translate-y-[2.7rem] relative">
        <Slider ref={sliderRef} {...sliderSettings}>
          {bannersToShow.map((banner, index) => (
            <div key={banner._id || `banner-${index}`} className="px-0 mx-0">
              <BannerItem banner={banner} index={index} />
            </div>
          ))}
        </Slider>
        {bannersToShow.length > 1 && <CustomDots />}
      </div>
    </div>
  );
};

export default Hero;