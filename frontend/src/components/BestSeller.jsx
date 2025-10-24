import { useContext, useState, useEffect, useMemo } from "react";
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

  // Use useMemo to filter and process bestseller products
  const processedBestSellers = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    try {
      // Try different possible property names for bestseller
      const bestProducts = products.filter((item) => {
        // Check multiple possible property names
        const isBestSeller = 
          item.bestseller || 
          item.bestSeller ||
          item.best_seller ||
          item.isBestseller ||
          item.isBestSeller ||
          item.featured || // sometimes featured products are considered best sellers
          item.bestseller === true ||
          item.bestseller === "true" ||
          item.bestseller === 1;

        return isBestSeller;
      });

      // If no best sellers found, use fallback (highest rated products)
      if (bestProducts.length === 0) {
        const fallbackBestSellers = [...products]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10);
        return fallbackBestSellers;
      }

      return bestProducts.slice(0, 10);

    } catch (err) {
      return [];
    }
  }, [products]);

  useEffect(() => {
    setBestSeller(processedBestSellers);
  }, [processedBestSellers]);

  // Custom Next Arrow Component
  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow next-arrow`}
        style={{ ...style, display: "block", right: "10px" }}
        onClick={onClick}
      >
        <div className="bg-black/90 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20">
          <FaChevronRight size={16} />
        </div>
      </div>
    );
  };

  // Custom Previous Arrow Component
  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow prev-arrow`}
        style={{ ...style, display: "block", left: "10px", zIndex: 1 }}
        onClick={onClick}
      >
        <div className="bg-black/90 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20">
          <FaChevronLeft size={16} />
        </div>
      </div>
    );
  };

  // Calculate grid columns for non-slider view (when less than 4 products)
  const getGridColumns = () => {
    const count = bestSeller.length;
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto";
    if (count === 4) return "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  };

  // Slick Slider settings - Show 4 products
  const sliderSettings = {
    dots: true,
    infinite: bestSeller.length >= 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: bestSeller.length >= 4,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: bestSeller.length >= 4,
    nextArrow: bestSeller.length >= 4 ? <NextArrow /> : undefined,
    prevArrow: bestSeller.length >= 4 ? <PrevArrow /> : undefined,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: bestSeller.length > 1
        }
      }
    ],
    appendDots: dots => (
      <div className="mt-8">
        <ul className="flex justify-center space-x-2"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <button className="w-3 h-3 rounded-full bg-gray-300 transition-all duration-300 hover:bg-gray-400 focus:outline-none"></button>
    )
  };

  // Show slider only if we have at least 4 products
  const showSlider = bestSeller.length >= 4;

  if (loading) {
    return (
      <div className="my-24">
        <div className="py-2 text-center text-3xl">
          <Title text1={"BEST"} text2={"SELLERS"} />
        </div>
        <div className="text-center text-gray-500 py-8">
          Loading best sellers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-24">
        <div className="py-8 text-center text-3xl">
          <Title text1={"BEST"} text2={"SELLERS"} />
          <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
            From Nature to Your Shelf — Discover the Organic Skincare Products Everyone's Talking About.
          </p>
        </div>
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="my-24">
      <div className="py-2 text-center text-3xl">
        <Title text1={"BEST"} text2={"SELLERS"} />
      </div>

      {bestSeller.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No best sellers available at the moment.
        </div>
      ) : showSlider ? (
        // Show slider when we have 4 or more products
        <div className="relative px-4">
          {/* Add custom CSS to ensure proper arrow styling */}
          <style jsx>{`
            .slick-prev, .slick-next {
              width: 40px;
              height: 40px;
            }
            .slick-prev:before, .slick-next:before {
              content: none !important;
            }
            .custom-arrow {
              z-index: 10;
            }
            .slick-slide {
              padding: 0 8px;
            }
            .slick-list {
              margin: 0 -8px;
            }
          `}</style>
          
          <Slider {...sliderSettings}>
            {bestSeller.map((item) => (
              <div key={item._id || item.id} className="px-2">
                <ProductItem
                  id={item._id || item.id}
                  image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
                  name={item.name || "Unnamed Product"}
                  price={item.price || 0}
                  discount={item.discountprice || item.discountPrice || 0}
                  rating={item.rating || 0}
                />
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        // Show regular grid when we have less than 4 products - using the same grid system
        <div className={`grid ${getGridColumns()} gap-4 gap-y-6 px-4`}>
          {bestSeller.map((item) => (
            <ProductItem
              key={item._id || item.id}
              id={item._id || item.id}
              image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
              name={item.name || "Unnamed Product"}
              price={item.price || 0}
              discount={item.discountprice || item.discountPrice || 0}
              rating={item.rating || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSeller;