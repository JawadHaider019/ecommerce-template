import { useContext, useState, useEffect, useMemo, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use useMemo to filter and process bestseller products - MAX 4 PRODUCTS
  const processedBestSellers = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    try {
      // Filter out draft products and only show published products
      const publishedProducts = products.filter(product => {
        const isPublished = product.status === 'published' || !product.status;
        return isPublished;
      });

      // STRICT filtering - only products explicitly marked as bestsellers
      const bestProducts = publishedProducts.filter((item) => {
        // Check each possible bestseller field explicitly
        const isExplicitBestSeller = 
          (item.bestseller === true || item.bestseller === "true") ||
          (item.bestSeller === true || item.bestSeller === "true") ||
          (item.best_seller === true || item.best_seller === "true") ||
          (item.isBestseller === true || item.isBestseller === "true") ||
          (item.isBestSeller === true || item.isBestSeller === "true");

        return isExplicitBestSeller;
      });

      // If no explicit best sellers found, show empty state
      if (bestProducts.length === 0) {
        return [];
      }

      // Limit to 4 bestseller products
      const finalBestSellers = bestProducts.slice(0, 4);

      return finalBestSellers;

    } catch (err) {
      return [];
    }
  }, [products]);

  useEffect(() => {
    setBestSeller(processedBestSellers);
  }, [processedBestSellers]);

  // Custom Next Arrow Component - Hide on mobile
  const NextArrow = ({ onClick }) => {
    return (
      <button
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-black/90 hover:bg-black text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20 hidden sm:flex"
        onClick={onClick}
        aria-label="Next products"
      >
        <FaChevronRight size={14} className="md:w-4 md:h-4" />
      </button>
    );
  };

  // Custom Previous Arrow Component - Hide on mobile
  const PrevArrow = ({ onClick }) => {
    return (
      <button
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-black/90 hover:bg-black text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20 hidden sm:flex"
        onClick={onClick}
        aria-label="Previous products"
      >
        <FaChevronLeft size={14} className="md:w-4 md:h-4" />
      </button>
    );
  };

  // Enhanced Slick Slider settings with proper spacing for fewer products - SAME AS BEFORE
  const sliderSettings = {
    dots: true,
    infinite: bestSeller.length > 1,
    speed: 500,
    slidesToShow: Math.min(4, bestSeller.length),
    slidesToScroll: 1,
    autoplay: bestSeller.length > Math.min(4, bestSeller.length),
    autoplaySpeed: 4000,
    pauseOnHover: true,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    arrows: false,
    centerMode: bestSeller.length <= 3, // Only center when we have few products
    centerPadding: bestSeller.length <= 3 ? "40px" : "0px", // Small padding only for few products
    focusOnSelect: false,
    beforeChange: (current, next) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(4, bestSeller.length),
          slidesToScroll: 1,
          infinite: bestSeller.length > 4,
          autoplay: bestSeller.length > 4,
          centerMode: bestSeller.length <= 3,
          centerPadding: bestSeller.length <= 3 ? "40px" : "0px"
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, bestSeller.length),
          slidesToScroll: 1,
          infinite: bestSeller.length > 3,
          autoplay: bestSeller.length > 3,
          centerMode: bestSeller.length <= 2,
          centerPadding: bestSeller.length <= 2 ? "40px" : "0px"
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, bestSeller.length),
          slidesToScroll: 1,
          infinite: bestSeller.length > 2,
          autoplay: bestSeller.length > 2,
          dots: true,
          centerMode: bestSeller.length <= 2,
          centerPadding: bestSeller.length <= 2 ? "20px" : "0px"
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: bestSeller.length > 1,
          autoplay: bestSeller.length > 1,
          dots: bestSeller.length > 1,
          arrows: false,
          swipe: true,
          touchMove: true,
          adaptiveHeight: false,
          centerMode: false,
          centerPadding: "0px"
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

  // Add inline styles to override slick dots and reduce spacing - SAME AS BEFORE
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
      /* Minimal spacing between slides */
      .slick-slide {
        padding: 0 4px !important;
      }
      .slick-list {
        margin: 0 -4px !important;
      }
      /* Ensure proper slide alignment */
      .slick-track {
        display: flex !important;
        align-items: stretch !important;
      }
      .slick-slide {
        height: auto !important;
        float: none !important;
      }
      .slick-slide > div {
        height: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Better approach: Use grid for 2-4 products, slider for 5+ products
  const shouldShowSlider = () => {
    return bestSeller.length >= 5; // Only use slider when we have 5 or more products
  };

  const shouldUseGrid = () => {
    return bestSeller.length >= 2 && bestSeller.length <= 4;
  };

  const [layoutType, setLayoutType] = useState('grid');

  useEffect(() => {
    const updateLayout = () => {
      if (bestSeller.length === 1) {
        setLayoutType('single');
      } else if (bestSeller.length >= 2 && bestSeller.length <= 4) {
        setLayoutType('grid');
      } else {
        setLayoutType('slider');
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    
    return () => {
      window.removeEventListener('resize', updateLayout);
    };
  }, [bestSeller.length]);

  // Calculate grid columns for optimal display - SAME AS BEFORE
  const getGridColumns = () => {
    const count = bestSeller.length;
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto";
    if (count === 4) return "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 max-w-7xl mx-auto";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  };

  if (loading) {
    return (
      <div className="my-16 md:my-24">
        <div className="py-2 text-center text-2xl md:text-3xl">
          <Title text1={"Popular"} text2={"Choices"} />
        </div>
        <div className="text-center text-gray-500 py-8">
          Loading best sellers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-16 md:my-24">
        <div className="flex justify-between flex-col md:flex-row md:items-start gap-3 md:gap-20 py-2 mx-4 md:mx-10 text-center md:text-left mb-5">
          <p className="w-full md:max-w-[50%] text-gray-800 font-normal leading-relaxed text-base text-lg  flex-1 order-2 md:order-1">
            Discover Pure Clay's best-selling organic collection, made in Pakistan with care. These natural, healthy, and sustainable products are favorites among our customers for everyday wellbeing.
          </p>
          <div className="flex-shrink-0 order-1 md:order-2">
            <Title text1={'Popular'} text2={'Choices'} />
          </div>
        </div>
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="my-16 md:my-24">
      <div className="flex justify-between flex-col md:flex-row md:items-start gap-3 md:gap-20 py-2 mx-4 md:mx-10 text-center md:text-left mb-5">
        <p className="w-full md:max-w-[50%] text-gray-800 font-normal leading-relaxed text-base text-lg  flex-1 order-2 md:order-1">
          Discover Pure Clay's best-selling organic collection, made in Pakistan with care. These natural, healthy, and sustainable products are favorites among our customers for everyday wellbeing.
        </p>
        <div className="flex-shrink-0 order-1 md:order-2">
          <Title text1={'Popular'} text2={'Choices'} />
        </div>
      </div>
      
      {bestSeller.length === 0 ? (
        <div className="text-center text-gray-500 py-8 px-4">
          No best sellers available at the moment. Check back soon!
        </div>
      ) : layoutType === 'slider' ? (
        // Show slider only when we have 5+ products - SAME AS BEFORE
        <div className="relative px-1 sm:px-2">
          <Slider ref={sliderRef} {...sliderSettings}>
            {bestSeller.map((item) => (
              <div key={item._id || item.id} className="px-0.5">
                <div className="mx-0">
                  <ProductItem
                    id={item._id || item.id}
                    image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
                    name={item.name || "Unnamed Product"}
                    price={item.price || 0}
                    discount={item.discountprice || item.discountPrice || 0}
                    rating={item.rating || 0}
                    status={item.status}
                  />
                </div>
              </div>
            ))}
          </Slider>
          
          {/* Add custom arrows outside the slider - hidden on mobile - SAME AS BEFORE */}
          {bestSeller.length > Math.min(4, bestSeller.length) && (
            <>
              <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
              <NextArrow onClick={() => sliderRef.current?.slickNext()} />
            </>
          )}
        </div>
      ) : layoutType === 'grid' ? (
        // Show grid for 2-4 products (better spacing control) - SAME AS BEFORE
        <div className={`grid ${getGridColumns()} gap-4 sm:gap-6 px-4 sm:px-6 mx-auto`}>
          {bestSeller.map((item) => (
            <ProductItem
              key={item._id || item.id}
              id={item._id || item.id}
              image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
              name={item.name || "Unnamed Product"}
              price={item.price || 0}
              discount={item.discountprice || item.discountPrice || 0}
              rating={item.rating || 0}
              status={item.status}
            />
          ))}
        </div>
      ) : (
        // Show single product centered - SAME AS BEFORE
        <div className="flex justify-center px-4">
          <div className="grid grid-cols-1 max-w-md mx-auto">
            {bestSeller.map((item) => (
              <ProductItem
                key={item._id || item.id}
                id={item._id || item.id}
                image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
                name={item.name || "Unnamed Product"}
                price={item.price || 0}
                discount={item.discountprice || item.discountPrice || 0}
                rating={item.rating || 0}
                status={item.status}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BestSeller;