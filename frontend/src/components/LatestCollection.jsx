import { useContext, useState, useEffect, useMemo, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from './Title';
import ProductItem from "./ProductItem";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use useMemo to filter and process products
  const processedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    try {
      // Filter out draft products and only show published products
      const publishedProducts = products.filter(product => {
        const isPublished = product.status === 'published' || !product.status;
        return isPublished;
      });

      // Remove duplicate products by ID and get latest 10 from published products
      const uniqueProducts = publishedProducts.filter((product, index, self) =>
        index === self.findIndex(p => p._id === product._id)
      );
      
      const latestUniqueProducts = uniqueProducts.slice(0, 10);

      return latestUniqueProducts;

    } catch (err) {
      return [];
    }
  }, [products]);

  useEffect(() => {
    setLatestProducts(processedProducts);
  }, [processedProducts]);

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

  // Calculate grid columns for non-slider view (when less than 4 products)
  const getGridColumns = () => {
    const count = latestProducts.length;
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto";
    if (count === 4) return "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  };

  // Enhanced Slick Slider settings for better mobile experience
  const sliderSettings = {
    dots: true, 
    infinite: latestProducts.length > 1,
    speed: 500,
    slidesToShow: Math.min(4, latestProducts.length),
    slidesToScroll: 1,
    autoplay: latestProducts.length > Math.min(4, latestProducts.length),
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    arrows: false,
    beforeChange: (current, next) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 1280, // Desktop
        settings: {
          slidesToShow: Math.min(3, latestProducts.length),
          slidesToScroll: 1,
          infinite: latestProducts.length > 3,
          autoplay: latestProducts.length > 3,
          dots: true // Ensure dots are enabled
        }
      },
      {
        breakpoint: 1024, // Small desktop/Tablet landscape
        settings: {
          slidesToShow: Math.min(3, latestProducts.length),
          slidesToScroll: 1,
          infinite: latestProducts.length > 3,
          autoplay: latestProducts.length > 3,
          dots: true // Ensure dots are enabled
        }
      },
      {
        breakpoint: 768, // Tablet
        settings: {
          slidesToShow: Math.min(2, latestProducts.length),
          slidesToScroll: 1,
          infinite: latestProducts.length > 2,
          autoplay: latestProducts.length > 2,
          dots: true // Ensure dots are enabled
        }
      },
      {
        breakpoint: 640, // Mobile
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: latestProducts.length > 1,
          autoplay: latestProducts.length > 1,
          dots: true, // Ensure dots are enabled
          arrows: false,
          swipe: true,
          touchMove: true,
          adaptiveHeight: true
        }
      },
      {
        breakpoint: 480, // Small mobile
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: latestProducts.length > 1,
          autoplay: latestProducts.length > 1,
          dots: true, // Ensure dots are enabled
          arrows: false,
          centerMode: false,
          swipe: true,
          touchMove: true,
          adaptiveHeight: true
        }
      }
    ],
    appendDots: dots => (
      <div className="mt-8 md:mt-10"> {/* Increased margin top */}
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

  // NEW: Always show slider when we have multiple products
  const shouldShowSlider = () => {
    // Always show slider if we have more than 1 product
    // This ensures dots are visible on all devices
    return latestProducts.length > 1;
  };

  const [showSlider, setShowSlider] = useState(false);

  // Update slider visibility on mount and resize
  useEffect(() => {
    const updateSliderVisibility = () => {
      setShowSlider(shouldShowSlider());
    };

    updateSliderVisibility();
    window.addEventListener('resize', updateSliderVisibility);
    
    return () => {
      window.removeEventListener('resize', updateSliderVisibility);
    };
  }, [latestProducts.length]);

  if (loading) {
    return (
      <div className="my-16 md:my-24">
        <div className="py-2 text-center text-2xl md:text-3xl">
          <Title text1={'New'} text2={'Arrivals'} />
        </div>
        <div className="text-center text-gray-500 py-8">
          Loading latest collections...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-16 md:my-24">
        <div className="flex justify-between flex-col md:flex-row md:items-start gap-3 md:gap-20 py-2 mx-4 md:mx-10 text-center md:text-left mb-5">
          <div className="flex-shrink-0">
            <Title text1={'New'} text2={'Arrivals'} />
          </div>
          <p className="w-full md:max-w-[60%] text-gray-800 font-normal leading-relaxed text-base text-lg  flex-1">
            Discover Pure Clay's newest range of organic products, proudly made in Pakistan. Each item is crafted with care, delivering natural, wholesome, and sustainable options for a healthier life.
          </p>
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
        <div className="flex-shrink-0">
          <Title text1={'New'} text2={'Arrivals'} />
        </div>
        <p className="w-full md:max-w-[50%] text-gray-800 font-normal leading-relaxed text-base text-lg  flex-1">
          Discover Pure Clay's newest range of organic products, proudly made in Pakistan. Each item is crafted with care, delivering natural, wholesome, and sustainable options for a healthier life.
        </p>
      </div>
      
      {latestProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8 px-4">
          No products available at the moment.
        </div>
      ) : showSlider ? (
        // Show slider when we have more products than can be shown on screen
        <div className="relative px-1 sm:px-2">
          <Slider ref={sliderRef} {...sliderSettings}>
            {latestProducts.map((item) => (
              <div key={item._id} className="px-0.5">
                <div className="mx-0">
                  <ProductItem
                    id={item._id}
                    image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
                    name={item.name}
                    price={item.price}
                    discount={item.discountprice}
                    rating={item.rating || 0}
                    status={item.status}
                  />
                </div>
              </div>
            ))}
          </Slider>
          
          {/* Add custom arrows outside the slider - hidden on mobile */}
          {latestProducts.length > Math.min(4, latestProducts.length) && (
            <>
              <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
              <NextArrow onClick={() => sliderRef.current?.slickNext()} />
            </>
          )}
        </div>
      ) : (
        // Show regular grid only when we have exactly 1 product
        <div className={`grid ${getGridColumns()} gap-2 sm:gap-3 gap-y-6 px-1 sm:px-2`}>
          {latestProducts.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
              name={item.name}
              price={item.price}
              discount={item.discountprice}
              rating={item.rating || 0}
              status={item.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestCollection;