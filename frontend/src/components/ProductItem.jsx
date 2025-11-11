import { useContext, useCallback, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { FaStar, FaStarHalf, FaRegStar, FaArrowRight } from 'react-icons/fa';

const ProductItem = ({ id, image, name, price, discount, rating, status = 'published' }) => {
  const { currency } = useContext(ShopContext);
  const navigate = useNavigate();

  // Don't render if product is not published
  if (status !== 'published') {
    return null;
  }

  const handleClick = useCallback(() => {
    navigate(`/product/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate, id]);

  // Memoized rating calculation
  const renderRating = useCallback((ratingValue = 0) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaStar size={14} />
          </span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaStarHalf size={14} />
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaRegStar size={14} />
          </span>
        );
      }
    }
    return stars;
  }, []);

  // Memoized price calculations
  const { actualPrice, discountPercentage, showDiscount } = useMemo(() => {
    const actualPrice = discount ? discount : price;
    const discountPercentage = discount ? Math.round(((price - discount) / price) * 100) : 0;
    const showDiscount = discount && discountPercentage > 0;
    
    return { actualPrice, discountPercentage, showDiscount };
  }, [price, discount]);

  // Memoized rating display
  const ratingDisplay = useMemo(() => {
    if (rating <= 0) return null;
    
    return (
      <div className="flex items-center gap-1 mb-3">
        {renderRating(rating)}
        <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  }, [rating, renderRating]);

  // Memoized discount badge
  const discountBadge = useMemo(() => {
    if (!showDiscount) return null;
    
    return (
      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
        -{discountPercentage}%
      </div>
    );
  }, [showDiscount, discountPercentage]);

  return (
    <div 
      onClick={handleClick} 
      className="cursor-pointer bg-white rounded-2xl border border-black/50 p-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-[420px] w-full max-w-[320px] mx-auto group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
          e.preventDefault();
        }
      }}
      aria-label={`View ${name} product details`}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-xl mb-4 flex-shrink-0">
        {discountBadge}
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden group-hover:shadow-md transition-shadow duration-300">
          <img
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={image}
            alt={name}
            loading="lazy"
            width={280}
            height={280}
            decoding="async"
          />
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base leading-tight flex-1 group-hover:text-gray-700 transition-colors">
          {name}
        </h3>
        
        {ratingDisplay}
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-gray-900">
                {currency} {actualPrice}
              </p>
              {showDiscount && (
                <p className="text-sm text-gray-500 line-through">
                  {currency} {price}
                </p>
              )}
            </div>
          </div>
          
          <button 
            className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-black group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 flex-shrink-0"
            aria-label="View product details"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <FaArrowRight size={14} className="text-white transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;