import { useState, useEffect } from "react";
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';

const DealItem = ({ 
  id, 
  image, 
  name, 
  price, 
  discount, 
  rating, 
  dealType, 
  productsCount, 
  endDate, 
  onDealClick, 
  currency 
}) => {
  const [timeLeft, setTimeLeft] = useState({});

  // Handle click event
  const handleClick = () => {
    onDealClick(id);
  };

  // Render rating stars
  const renderRating = (ratingValue = 0) => {
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
  };

  // Calculate discount percentage
  const discountPercentage = discount && price > discount 
    ? Math.round(((price - discount) / price) * 100)
    : 0;

  // Get deal type badge styling
  const getDealTypeBadge = (type) => {
    const typeMap = {
      'flash_sale': { label: 'Flash Sale', color: 'bg-red-500 text-white' },
      'seasonal': { label: 'Seasonal', color: 'bg-green-500 text-white' },
      'clearance': { label: 'Clearance', color: 'bg-orange-500 text-white' },
      'bundle': { label: 'Bundle', color: 'bg-purple-500 text-white' },
      'featured': { label: 'Featured', color: 'bg-blue-500 text-white' },
      'buyonegetone': { label: 'BOGO', color: 'bg-pink-500 text-white' },
      'daily_deal': { label: 'Daily Deal', color: 'bg-indigo-500 text-white' },
      'weekly_special': { label: 'Weekly Special', color: 'bg-teal-500 text-white' }
    };
    
    return typeMap[type] || { label: type || 'Deal', color: 'bg-gray-500 text-white' };
  };

  const dealTypeBadge = getDealTypeBadge(dealType);

  // Countdown timer effect for flash sales
  useEffect(() => {
    if (dealType === 'flash_sale' && endDate) {
      const calculateTimeLeft = () => {
        const difference = new Date(endDate) - new Date();
        if (difference <= 0) return {};
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      };

      setTimeLeft(calculateTimeLeft());
      const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
      return () => clearInterval(timer);
    }
  }, [endDate, dealType]);

  // Determine the actual price to display
  const displayPrice = discount && discount < price ? discount : price;
  const hasDiscount = discount && discount < price;

  return (
    <div onClick={handleClick} className="cursor-pointer text-gray-700 group">
      <div className="relative overflow-hidden  bg-gray-100">
        {/* Discount Badge */}
        {hasDiscount && discountPercentage > 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-xs font-medium text-white z-10">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Deal Type Badge */}
        <div className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${dealTypeBadge.color} z-10`}>
          {dealTypeBadge.label}
        </div>

        {/* Product Image */}
        <img
          className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          src={image}
          alt={name}
          onError={(e) => { 
            e.target.src = "/images/fallback-image.jpg";
          }}
        />

        {/* Products Count Badge */}
        {productsCount > 0 && (
          <div className="absolute left-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 z-10">
            {productsCount} item{productsCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
          {name}
        </p>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {renderRating(rating)}
            </div>
            <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">
            {currency} {displayPrice.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="text-sm text-gray-500 line-through">
              {currency} {price.toFixed(2)}
            </p>
          )}
        </div>

        {/* Countdown Timer for Flash Sales */}
        {dealType === 'flash_sale' && endDate && Object.keys(timeLeft).length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded-md">
            <div className="text-xs text-red-600 font-medium text-center">
              Ends in:{" "}
              <span className="font-bold">
                {timeLeft.hours?.toString().padStart(2, '0')}:
                {timeLeft.minutes?.toString().padStart(2, '0')}:
                {timeLeft.seconds?.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Expired Notice */}
        {dealType === 'flash_sale' && endDate && Object.keys(timeLeft).length === 0 && (
          <div className="mt-2 p-2 bg-gray-100 rounded-md">
            <div className="text-xs text-gray-500 font-medium text-center">
              Deal Expired
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealItem;