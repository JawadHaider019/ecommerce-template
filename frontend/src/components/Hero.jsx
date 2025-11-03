import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);

  // Refs for animation elements
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const buttonRef = useRef(null);
  const blogCardRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

  // Custom dots component using Tailwind - UPDATED FOR MOBILE
  const CustomDots = ({ dots }) => (
    <div className="absolute left-4 md:left-16 bottom-10 md:bottom-20 z-20 flex flex-col gap-1">
      <ul className="flex flex-col gap-1 m-0 p-0 md:flex-col md:gap-1">
        {dots}
      </ul>
    </div>
  );

  // Mobile Custom dots component
  const MobileCustomDots = ({ dots }) => (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <ul className="flex flex-row gap-2 m-0 p-0">
        {dots}
      </ul>
    </div>
  );

  // Slider settings with custom dots using Tailwind
  const settings = useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    fade: true,
    lazyLoad: 'progressive',
    cssEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    adaptiveHeight: false,
    touchThreshold: 10,
    swipe: true,
    appendDots: dots => <CustomDots dots={dots} />,
    customPaging: i => (
      <button className="w-2 h-2 rounded-full bg-white/50 transition-all duration-300 hover:bg-white/80 hover:scale-110 focus:outline-none" />
    ),
    dotsClass: "slick-dots !flex !flex-col !static !w-auto !m-0",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
          appendDots: dots => <MobileCustomDots dots={dots} />,
          customPaging: i => (
            <button className="w-2 h-2 rounded-full bg-white/50 transition-all duration-300 hover:bg-white/80 hover:scale-110 focus:outline-none" />
          ),
          dotsClass: "slick-dots !flex !flex-row !static !w-auto !m-0 justify-center"
        }
      }
    ]
  }), []);

  // Banner Item Component
  const BannerItem = useCallback(({ banner, index }) => (
    <section className="relative w-full h-[90vh] overflow-hidden bg-black">
      {/* Background Image */}
      <img
        src={banner.imageUrl}
        alt={banner.headingLine1 || "Natura Bliss Banner"}
        className="w-full h-full object-cover"
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
        width="1920"
        height="1080"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-2"></div>

      {/* Main Headline - Responsive */}
      <h1
        ref={headlineRef}
        className="text-oswald absolute top-10 md:top-25 left-4 md:left-16 text-5xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold text-white uppercase leading-none tracking-tighter z-10"
      >
        {banner.headingLine1}
        {banner.headingLine2 && (
          <>
            <br />
            <span className="md:pl-10 pl-0 mb-2 text-oswald text-holo">{banner.headingLine2}</span>
          </>
        )}
      </h1>

      <div className="absolute bottom-20 md:bottom-10 right-4 md:right-10 text-white z-10 mx-2 mt-2">
        {banner.subtext && (
          <p className="font-mono text-sm uppercase max-w-60 md:max-w-80 border-y border-white/70 py-2 text-white/90">
            {banner.subtext}
          </p>
        )}

        {/* Button - Responsive */}
        {banner.buttonText && banner.redirectUrl && (
          <div
            ref={buttonRef}
            className="text-right relative z-30"
          >
            <Link
              to={banner.redirectUrl}
              onClick={handleButtonClick}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm md:text-base font-semibold text-white lowercase transition-all duration-300 hover:text-gray-100 hover:scale-105 relative z-30 pointer-events-auto"
              aria-label={`${banner.buttonText} - ${banner.headingLine1}`}
            >
              {banner.buttonText}
              <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-black rounded-full">
                <IoIosArrowForward size={16} />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  ), [handleButtonClick]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        <div className="absolute inset-0 bg-black/50 z-2"></div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200"></div>
        <div className="absolute inset-0 bg-black/20 z-2"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-center text-gray-800 px-6">
          <div>
            <p className="text-xl mb-6 font-medium">{error}</p>
            <button
              onClick={fetchBanners}
              className="px-8 py-3 text-base font-medium text-white bg-black rounded-lg transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
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
      <section className="relative w-full h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200"></div>
        <div className="h-full flex items-center justify-center text-center text-gray-600 px-6">
          <div>
            <p className="text-xl font-medium mb-4">No banners available</p>
            <button
              onClick={fetchBanners}
              className="px-6 py-2 text-gray-600 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="relative w-full overflow-hidden" aria-label="Featured banners">
      {/* Global styles for active dot state with responsive classes */}
      <style>{`
        .slick-dots li.slick-active button {
          background: white !important;
          transform: scale(1.2);
        }
        
        /* Mobile-specific dot positioning */
        @media (max-width: 768px) {
          .slick-dots {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            position: absolute !important;
            bottom: 1.5rem !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: auto !important;
          }
        }
      `}</style>
      
      <Slider ref={sliderRef} {...settings}>
        {banners.map((banner, index) => (
          <BannerItem key={banner._id || banner.imageUrl} banner={banner} index={index} />
        ))}
      </Slider>
    </div>
  );
};

export default Hero;