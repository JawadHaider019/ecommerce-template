import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowForward } from "react-icons/io";
import { FaWhatsapp, FaTiktok, FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { assets } from "../assets/assets";

const Hero = () => {
  // Show fallback banner IMMEDIATELY
  const [banners, setBanners] = useState([
    {
      _id: 'fallback',
      imageUrl: assets.hero_img,
      headingLine1: 'Premium',
      headingLine2: 'Experience',
      subtext: 'Discover our exclusive collection and services',
      buttonText: 'Explore Now',
      redirectUrl: '/collection'
    }
  ]);
  
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

  // FIX 1: Pre-calculate fixed heights to prevent shifts
  const HERO_CONTAINER_HEIGHT = 'h-[100vh] md:h-screen'; // Keep your exact height
  const TRANSLATE_VALUE = '-translate-y-9 md:-translate-y-[2.7rem]'; // Your exact translate

  // Preload fallback image
  useEffect(() => {
    const img = new Image();
    img.src = assets.hero_img;
    img.loading = 'eager';
  }, []);

  // Fetch banners in background
  useEffect(() => {
    if (!backendUrl) return;

    const fetchBanners = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/banners/active`, {
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            // Preload first banner image before updating
            const preloadPromises = data.data.slice(0, 3).map(banner => {
              return new Promise((resolve) => {
                const img = new Image();
                img.src = banner.imageUrl;
                img.onload = resolve;
              });
            });
            
            await Promise.race(preloadPromises); // Wait for first image
            setBanners(data.data); // Update without layout shift
          }
        }
      } catch (error) {
        // Keep fallback
      }
    };

    const timer = setTimeout(fetchBanners, 50);
    return () => clearTimeout(timer);
  }, [backendUrl]);

  // Fetch business details
  useEffect(() => {
    if (!backendUrl) return;

    const fetchBusinessDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/business-details`, {
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBusinessInfo(data.data);
          }
        }
      } catch (error) {
        // Silently fail
      }
    };

    setTimeout(fetchBusinessDetails, 200);
  }, [backendUrl]);

  // Social Media Component - FIXED: Always renders with reserved space
  const SocialMediaIcons = ({ layout = 'row', className = "", iconSize = 20 }) => {
    const platforms = [
      { key: 'whatsapp', icon: FaWhatsapp, label: 'WhatsApp' },
      { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
      { key: 'facebook', icon: FaFacebookF, label: 'Facebook' },
      { key: 'instagram', icon: FaInstagram, label: 'Instagram' }
    ];

    if (layout === 'column') {
      return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
          {platforms.map((platform) => {
            const socialUrl = businessInfo.socialMedia?.[platform.key];
            const Icon = platform.icon;
            
            return (
              <a
                key={platform.key}
                href={socialUrl || "#"}
                target={socialUrl ? "_blank" : "_self"}
                rel={socialUrl ? "noopener noreferrer" : ""}
                className={`text-white hover:text-white/90 transition-colors duration-300 transform hover:scale-110 ${
                  !socialUrl ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={!socialUrl ? (e) => e.preventDefault() : undefined}
              >
                <Icon size={iconSize} />
              </a>
            );
          })}
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {platforms.map((platform) => {
          const socialUrl = businessInfo.socialMedia?.[platform.key];
          const Icon = platform.icon;
          
          return (
            <a
              key={platform.key}
              href={socialUrl || "#"}
              target={socialUrl ? "_blank" : "_self"}
              rel={socialUrl ? "noopener noreferrer" : ""}
              className={`text-white/80 hover:text-white transition-colors duration-300 transform hover:scale-110 ${
                !socialUrl ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={!socialUrl ? (e) => e.preventDefault() : undefined}
            >
              <Icon size={iconSize} />
            </a>
          );
        })}
      </div>
    );
  };

  // Slider settings (YOUR EXACT SETTINGS)
  const sliderSettings = {
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
    cssEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    beforeChange: (_, next) => setCurrentSlide(next),
  };

  // FIXED Banner Item Component - Preserves your styling but prevents CLS
  const BannerItem = ({ banner, index }) => {
    return (
      <section className="relative w-full h-full">
        {/* Background Image Container - Your exact classes */}
        <div className={`w-full ${HERO_CONTAINER_HEIGHT} rounded-3xl md:rounded-4xl mx-auto overflow-hidden`}>
          {/* IMAGE - With dimensions to prevent CLS */}
          <img
            src={banner.imageUrl}
            alt={banner.headingLine1 || "Premium Banner"}
            className="w-full h-full object-cover opacity-100"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            width="1920"
            height="1080"
            // Critical: These attributes prevent layout shift
            style={{ aspectRatio: '16/9', objectFit: 'cover' }}
          />
        </div>

        {/* Overlays - Your exact classes */}
        <div className="absolute inset-0 bg-black/30 z-2 rounded-3xl md:rounded-4xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-3 rounded-3xl md:rounded-4xl"></div>

        {/* Content - With reserved spaces to prevent shifts */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center px-4 md:px-6 max-w-7xl md:max-w-8xl">
            
            {/* FIX: Reserved space for headline */}
            <div className="min-h-[120px] md:min-h-[180px] flex items-center justify-center">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase mb-4 md:mb-6">
                {banner.headingLine1}
                {banner.headingLine2 && (
                  <> <span className="font-bold">{banner.headingLine2}</span></>
                )}
              </h1>
            </div>
          
            {/* FIX: Reserved space for subtext */}
            <div className="min-h-[60px] md:min-h-[80px] flex items-center justify-center">
              {banner.subtext && (
                <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-xs sm:max-w-sm md:max-w-2xl mx-auto leading-relaxed mb-6 md:mb-10 px-2">
                  {banner.subtext}
                </p>
              )}
            </div>

            {/* FIX: Reserved space for CTA button */}
            <div className="min-h-[56px] md:min-h-[64px] flex items-center justify-center">
              {banner.buttonText && banner.redirectUrl && (
                <div className="relative z-30">
                  <Link
                    to={banner.redirectUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 text-white border border-white/50 rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/80 group"
                  >
                    <span className="text-xs md:text-sm font-medium tracking-wider uppercase">
                      {banner.buttonText}
                    </span>
                    <IoIosArrowForward size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Social Media - Always rendered */}
            <div className="mt-6 md:mt-8 md:hidden flex justify-center">
              <SocialMediaIcons layout="row" iconSize={20} />
            </div>
          </div>
        </div>

        {/* Desktop Social Media - Fixed position */}
        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-12 z-10 hidden md:flex flex-col gap-3 md:gap-4">
          <SocialMediaIcons layout="column" iconSize={18} />
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-12 z-10">
          <div className="text-white/80 text-sm md:text-lg font-light tracking-wide">
            {(index + 1).toString().padStart(2, '0')} / {banners.length.toString().padStart(2, '0')}
          </div>
        </div>
      </section>
    );
  };

  // Custom Dots Component (Your exact styling)
  const CustomDots = () => {
    if (banners.length <= 1) return null;

    return (
      <div className="absolute -bottom-10 md:-bottom-16 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => sliderRef.current?.slickGoTo(index)}
              className="focus:outline-none transition-all duration-300"
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

  return (
    <div className={`relative w-full transform ${TRANSLATE_VALUE}`}>
      <style>{`
        .slick-slide > div {
          border-radius: 1.5rem;
          height: 100%;
        }
        .slick-list {
          border-radius: 1.5rem;
          height: 100% !important;
        }
        .slick-track {
          height: 100% !important;
        }
        .slick-slider {
          height: 100%;
        }
      `}</style>
      
      <div className={`transform ${TRANSLATE_VALUE} relative`}>
        <Slider ref={sliderRef} {...sliderSettings}>
          {banners.map((banner, index) => (
            <div key={banner._id || `banner-${index}`} className="px-0 mx-0 h-full">
              <BannerItem banner={banner} index={index} />
            </div>
          ))}
        </Slider>
        {banners.length > 1 && <CustomDots />}
      </div>
    </div>
  );
};

export default Hero;