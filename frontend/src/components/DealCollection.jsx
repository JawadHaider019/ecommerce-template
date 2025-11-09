import { useContext, useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import Title from './Title';
import DealItem from "./DealItem.jsx";
import axios from 'axios';
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Import Slick Carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Memoized arrow components - IMPROVED VERSION
const NextArrow = memo(({ onClick, isVisible }) => (
  <button
    className={`absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-black/90 hover:bg-black text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
    onClick={onClick}
    aria-label="Next deals"
  >
    <FaChevronRight size={14} className="md:w-4 md:h-4" />
  </button>
));

const PrevArrow = memo(({ onClick, isVisible }) => (
  <button
    className={`absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-black/90 hover:bg-black text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
    onClick={onClick}
    aria-label="Previous deals"
  >
    <FaChevronLeft size={14} className="md:w-4 md:h-4" />
  </button>
));

const DealCollection = () => {
  const { backendUrl, currency, deals: contextDeals } = useContext(ShopContext);
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const mountedRef = useRef(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);

  // Use context deals immediately if available
  const initialDeals = useMemo(() => {
    return Array.isArray(contextDeals) ? contextDeals : [];
  }, [contextDeals]);

  // Memoized helper function
  const getDealTypeName = useCallback((dealType) => {
    return dealType || 'Deal';
  }, []);

  // Fast fetch with timeout
  const fetchDeals = useCallback(async (signal) => {
    try {
      const response = await axios.get(`${backendUrl}/api/deal/list`, {
        timeout: 3000,
        signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      return response.data.success ? (response.data.deals || []) : [];
    } catch (error) {
      if (!axios.isCancel(error)) {
        throw error;
      }
    }
  }, [backendUrl]);

  // Process deals with minimal logic
  const processedDeals = useMemo(() => {
    const source = deals.length > 0 ? deals : initialDeals;
    
    if (!source.length) return [];

    const now = Date.now();
    return source
      .filter(deal => {
        if (deal.status !== 'published') return false;
        
        const start = deal.dealStartDate ? new Date(deal.dealStartDate).getTime() : 0;
        const end = deal.dealEndDate ? new Date(deal.dealEndDate).getTime() : Infinity;
        
        return start <= now && end >= now;
      })
      .slice(0, 8);
  }, [deals, initialDeals]);

  // Load deals in background without blocking render
  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    // Only fetch if we don't have initial deals
    if (initialDeals.length === 0) {
      setLoading(true);
      
      const loadDeals = async () => {
        try {
          const dealsData = await fetchDeals(controller.signal);
          if (mountedRef.current && dealsData.length > 0) {
            setDeals(dealsData);
          }
        } catch (err) {
          if (mountedRef.current && !axios.isCancel(err)) {
            // Silent error handling
          }
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      };

      // Small delay to allow initial render
      setTimeout(loadDeals, 100);
    } else {
      // We have initial deals, render immediately
      setDeals(initialDeals);
    }

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [fetchDeals, initialDeals]);

  // Optimized click handler
  const handleDealClick = useCallback((dealId) => {
    navigate(`/deal/${dealId}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }, [navigate]);

  // Add inline styles to override slick dots
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slick-dots {
        position: relative !important;
        bottom: 0 !important;
        margin-top: 2rem !important;
      }
      .slick-dots li button:before {
        display: none !important;
      }
      .slick-dots li {
        margin: 0 !important;
        width: auto !important;
        height: auto !important;
      }
      .slick-dots li button {
        padding: 0 !important;
        width: 30px !important;
        height: 30px !important;
      }
      .slick-dots li button:hover,
      .slick-dots li button:focus {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Calculate if arrows should be visible
  const shouldShowArrows = useMemo(() => {
    return processedDeals.length > slidesToShow;
  }, [processedDeals.length, slidesToShow]);

  // Memoized view configuration - UPDATED with infinite sliding and arrows
  const viewConfig = useMemo(() => {
    const count = processedDeals.length;
    const showSlider = count > 1; // Always show slider for 2+ products
    
    const gridColumns = 
      count === 1 ? "grid-cols-1 max-w-xs mx-auto" :
      count === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" :
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-6xl mx-auto";

    const sliderSettings = {
      dots: true, // Always enable dots when slider is shown
      infinite: count > 1, // Enable infinite sliding when we have more than 1 item
      speed: 500,
      slidesToShow: Math.min(4, count),
      slidesToScroll: 1,
      autoplay: count > 1,
      autoplaySpeed: 4000,
      pauseOnHover: true,
      swipe: true,
      swipeToSlide: true,
      touchThreshold: 10,
      arrows: false, // We'll use custom arrows
      beforeChange: (current, next) => {
        setCurrentSlide(next);
        // Update slidesToShow based on current responsive breakpoint
        const currentSlidesToShow = Math.min(4, count);
        setSlidesToShow(currentSlidesToShow);
      },
      responsive: [
        {
          breakpoint: 1280, // Desktop
          settings: {
            slidesToShow: Math.min(4, count),
            slidesToScroll: 1,
            infinite: count > 4,
            autoplay: count > 4,
            dots: true
          }
        },
        {
          breakpoint: 1024, // Small desktop/Tablet landscape
          settings: {
            slidesToShow: Math.min(3, count),
            slidesToScroll: 1,
            infinite: count > 3,
            autoplay: count > 3,
            dots: true
          }
        },
        {
          breakpoint: 768, // Tablet
          settings: {
            slidesToShow: Math.min(2, count),
            slidesToScroll: 1,
            infinite: count > 2,
            autoplay: count > 2,
            dots: true
          }
        },
        {
          breakpoint: 640, // Mobile
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: count > 1,
            autoplay: count > 1,
            dots: true,
            arrows: false,
            swipe: true,
            touchMove: true,
            adaptiveHeight: true
          }
        }
      ],
      appendDots: dots => (
        <div className="mt-8 md:mt-10">
          <ul style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '8px',
            padding: 0,
            margin: 0,
            listStyle: 'none'
          }}> 
            {dots}
          </ul>
        </div>
      ),
      customPaging: i => (
        <button 
          style={{
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label={`Go to slide ${i + 1}`}
        >
          <div 
            style={{
              width: i === currentSlide ? '24px' : '8px',
              height: i === currentSlide ? '4px' : '8px',
              backgroundColor: i === currentSlide ? '#000' : '#d1d5db',
              borderRadius: i === currentSlide ? '2px' : '50%',
              transition: 'all 0.3s ease'
            }}
          />
        </button>
      )
    };

    return { showSlider, gridColumns, sliderSettings, count };
  }, [processedDeals.length, currentSlide]);

  // Memoized deals rendering
  const renderedDeals = useMemo(() => 
    processedDeals.map((deal) => (
      <DealItem
        key={deal._id}
        id={deal._id}
        image={deal.dealImages?.[0]}
        name={deal.dealName}
        price={deal.dealTotal || 0}
        discount={deal.dealFinalPrice || 0}
        rating={0}
        dealType={getDealTypeName(deal.dealType)}
        productsCount={deal.dealProducts?.length || 0}
        endDate={deal.dealEndDate}
        onDealClick={handleDealClick}
        currency={currency}
      />
    )), [processedDeals, getDealTypeName, handleDealClick, currency]
  );

  // Show content immediately with available data
  const hasContent = processedDeals.length > 0 || initialDeals.length > 0;

  // Don't render anything if no deals
  if (!hasContent && !loading) {
    return null;
  }

  if (!hasContent && loading) {
    return (
      <div className="my-12">
        <div className="py-2 text-center">
          <div className="text-3xl">
            <Title text1={'HOT'} text2={'DEALS'} />
          </div>
          <p className="text-[16px] text-gray-600 my-3 font-light">
            Trending Deals — Discover Organic Products Handcrafted with Care and Loved by All.
          </p>
        </div>
        
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (error && !hasContent) {
    return (
      <div className="my-12">
        <div className="py-4 text-center text-3xl">
          <Title text1={'HOT'} text2={'DEALS'} />
        </div>
        <p className="text-lg text-gray-600 font-light">
          Grab Pure Clay's special deals — organic goodness, proudly made in Pakistan
        </p>
        <div className="text-center text-gray-500 py-4 text-sm">
          Check your connection
        </div>
      </div>
    );
  }

  return (
    <div className="my-12">
      <div className="py-4 text-center">
        <div className="text-3xl">
          <Title text1={'HOT'} text2={'DEALS'} />
        </div>
        <p className="text-[16px] text-gray-600 font-light">
          Grab Pure Clay's special deals — organic goodness, proudly made in Pakistan
        </p>
      </div>

      {processedDeals.length === 0 ? (
        <div className="text-center text-gray-400 py-6 text-sm">
          No deals available
        </div>
      ) : viewConfig.showSlider ? (
        <div className="relative px-1 sm:px-2">
          <Slider ref={sliderRef} {...viewConfig.sliderSettings}>
            {processedDeals.map((deal) => (
              <div key={deal._id} className="px-0.5">
                <div className="mx-0">
                  <DealItem
                    id={deal._id}
                    image={deal.dealImages?.[0]}
                    name={deal.dealName}
                    price={deal.dealTotal || 0}
                    discount={deal.dealFinalPrice || 0}
                    rating={0}
                    dealType={getDealTypeName(deal.dealType)}
                    productsCount={deal.dealProducts?.length || 0}
                    endDate={deal.dealEndDate}
                    onDealClick={handleDealClick}
                    currency={currency}
                  />
                </div>
              </div>
            ))}
          </Slider>
          
          {/* Add custom arrows outside the slider - visible when needed */}
          {shouldShowArrows && (
            <>
              <PrevArrow 
                onClick={() => sliderRef.current?.slickPrev()} 
                isVisible={shouldShowArrows}
              />
              <NextArrow 
                onClick={() => sliderRef.current?.slickNext()} 
                isVisible={shouldShowArrows}
              />
            </>
          )}
        </div>
      ) : (
        // Show regular grid only when we have exactly 1 product
        <div className={`grid ${viewConfig.gridColumns} gap-1 sm:gap-2 gap-y-4 px-0 sm:px-1`}>
          {renderedDeals}
        </div>
      )}
      
      {/* Invisible loading indicator */}
      {loading && (
        <div className="hidden">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
        </div>
      )}
    </div>
  );
};

export default memo(DealCollection);