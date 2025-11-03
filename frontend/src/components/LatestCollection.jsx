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
  const sliderRef = useRef(null); // Added missing ref

  // Use useMemo to filter and process products
  const processedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    // Remove duplicate products by ID and get latest 10
    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex(p => p._id === product._id)
    );
    
    return uniqueProducts.slice(0, 10);
  }, [products]);

  useEffect(() => {
    setLatestProducts(processedProducts);
  }, [processedProducts]);

  // Custom Next Arrow Component
  const NextArrow = ({ onClick }) => {
    return (
      <button
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-black/90 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20"
        onClick={onClick}
      >
        <FaChevronRight size={16} />
      </button>
    );
  };

  // Custom Previous Arrow Component
  const PrevArrow = ({ onClick }) => {
    return (
      <button
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-black/90 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-white/20"
        onClick={onClick}
      >
        <FaChevronLeft size={16} />
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

  // Slick Slider settings - Show 4 products
  const sliderSettings = {
    dots: true,
    infinite: latestProducts.length >= 4,
    speed: 500,
    slidesToShow: Math.min(4, latestProducts.length),
    slidesToScroll: 1,
    autoplay: latestProducts.length >= 4,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false, // Disable Slick's default arrows completely
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(4, latestProducts.length),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, latestProducts.length),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, latestProducts.length),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: latestProducts.length > 1
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
  const showSlider = latestProducts.length >= 4;

  if (loading) {
    return (
      <div className="my-24">
        <div className="py-2 text-center text-3xl">
          <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        </div>
        <div className="text-center text-gray-500 py-8">
          Loading latest collections...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-24">
        <div className="py-4 text-center text-3xl">
          <Title text1={'LATEST'} text2={'COLLECTIONS'} />
         <p className="text-[16px] text-gray-600 font-light">
            Experience the Beauty of Nature with Natura Bliss's Newest Organic Skincare Collection
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
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
     <p className="text-[16px] text-gray-600 font-light">
            Experience the Beauty of Nature with Natura Bliss's Newest Organic Skincare Collection
          </p>
      </div>

      {latestProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No products available at the moment.
        </div>
      ) : showSlider ? (
        // Show slider when we have 4 or more products
        <div className="relative px-4">
          <Slider ref={sliderRef} {...sliderSettings}>
            {latestProducts.map((item) => (
              <div key={item._id} className="px-2">
                <ProductItem
                  id={item._id}
                  image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
                  name={item.name}
                  price={item.price}
                  discount={item.discountprice}
                  rating={item.rating || 0}
                />
              </div>
            ))}
          </Slider>
          
          {/* Add custom arrows outside the slider */}
          {latestProducts.length >= 4 && (
            <>
              <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
              <NextArrow onClick={() => sliderRef.current?.slickNext()} />
            </>
          )}
        </div>
      ) : (
        // Show regular grid when we have less than 4 products - using the same grid system
        <div className={`grid ${getGridColumns()} gap-4 gap-y-6 px-4`}>
          {latestProducts.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image && item.image.length > 0 ? item.image[0] : "/images/fallback-image.jpg"}
              name={item.name}
              price={item.price}
              discount={item.discountprice}
              rating={item.rating || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestCollection;