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
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaStar size={14} />
          </span>
        );
      } else if (i - 0.5 <= ratingValue) {
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
      <div className="absolute right-2 top-2 rounded-full bg-black px-3 py-1 text-xs font-medium text-white z-10">
        {discountPercentage}% OFF
      </div>
    );
  }, [showDiscount, discountPercentage]);

  return (
    <div 
      onClick={handleClick} 
      className="cursor-pointer bg-white rounded-2xl border border-black/80 p-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
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
      <div className="relative overflow-hidden rounded-xl mb-4">
        {discountBadge}
        <img
          className="w-full h-48 object-cover rounded-xl transition-transform duration-500 hover:scale-105"
          src={image}
          alt={name}
          loading="lazy"
          width="300"
          height="192"
          decoding="async"
        />
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
        {name}
      </h3>
      
      {ratingDisplay}
      
      <div className="flex items-center justify-between">
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
        
        <div 
          className="w-9 h-9 bg-black rounded-full flex items-center justify-center transition-colors duration-200"
          aria-hidden="true"
        >
          <FaArrowRight size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default ProductItem;