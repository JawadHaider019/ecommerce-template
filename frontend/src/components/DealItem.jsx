import { useState, useEffect } from "react";
import { FaStar, FaStarHalf, FaRegStar, FaClock, FaFire } from 'react-icons/fa';

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

  const handleClick = () => {
    onDealClick(id);
  };

  const getDealTypeName = (type) => {
    if (!type) return 'Deal';
    if (typeof type === 'object') return type.name || 'Deal';
    return type || 'Deal';
  };

  const getDealTypeSlug = (type) => {
    if (!type) return 'deal';
    if (typeof type === 'object') return type.slug || 'deal';
    return type || 'deal';
  };

  const renderRating = (ratingValue = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<FaStar key={i} size={12} className="text-yellow-400" />);
      } else if (i - 0.5 <= ratingValue) {
        stars.push(<FaStarHalf key={i} size={12} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} size={12} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const discountPercentage = discount && price > discount 
    ? Math.round(((price - discount) / price) * 100)
    : 0;

  const getDealTypeBadge = (type) => {
    const dealTypeSlug = getDealTypeSlug(type);
    const dealTypeName = getDealTypeName(type);
    
    const typeMap = {
      'flash_sale': { label: 'FLASH SALE', color: 'bg-red-600 text-white', icon: FaFire },
      'seasonal': { label: 'SEASONAL', color: 'bg-green-600 text-white' },
      'clearance': { label: 'CLEARANCE', color: 'bg-orange-600 text-white' },
      'bundle': { label: 'BUNDLE', color: 'bg-purple-600 text-white' },
      'featured': { label: 'FEATURED', color: 'bg-blue-600 text-white' },
      'buyonegetone': { label: 'BOGO', color: 'bg-pink-600 text-white' },
      'daily_deal': { label: 'DAILY DEAL', color: 'bg-indigo-600 text-white' },
      'weekly_special': { label: 'WEEKLY SPECIAL', color: 'bg-teal-600 text-white' }
    };
    
    return typeMap[dealTypeSlug] || { label: dealTypeName, color: 'bg-gray-600 text-white' };
  };

  const dealTypeBadge = getDealTypeBadge(dealType);
  const IconComponent = dealTypeBadge.icon;

  useEffect(() => {
    const dealTypeSlug = getDealTypeSlug(dealType);
    if (dealTypeSlug === 'flash_sale' && endDate) {
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

  const displayPrice = discount && discount < price ? discount : price;
  const hasDiscount = discount && discount < price;

  return (
    <div onClick={handleClick} className="relative cursor-pointer bg-white border border-gray-300 group hover:border-black transition-all duration-200">
      {/* Badges Container */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-start">
        {/* Deal Type Badge */}
        <div className={`rounded-full px-2 py-1 text-xs  bg-red-600 ${dealTypeBadge.color}`}>
          {dealTypeBadge.label}
        </div>

        {/* Discount Badge */}
        {hasDiscount && discountPercentage > 0 && (
          <div className="rounded-full bg-black text-white px-2 py-1 text-xs ">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="relative overflow-hidden bg-gray-50">
        {/* Product Image */}
        <img
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          src={image}
          alt={name}
          onError={(e) => { 
            e.target.src = "/images/fallback-image.jpg";
          }}
        />

        {/* Products Count Badge */}
        {productsCount > 0 && (
          <div className="absolute left-2 bottom-2 bg-black/80 text-white px-2 py-1 text-xs font-medium rounded">
            {productsCount} item{productsCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
          {name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderRating(rating)}
            </div>
            <span className="text-xs text-gray-600 font-medium">({rating.toFixed(1)})</span>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-red-600">
            {currency} {displayPrice?.toFixed(2) || '0.00'}
          </p>
          {hasDiscount && (
            <p className="text-sm text-gray-500 line-through font-medium">
              {currency} {price?.toFixed(2) || '0.00'}
            </p>
          )}
        </div>

        {/* Savings Amount */}
        {hasDiscount && (
          <div className="text-xs text-green-600 font-medium">
            You save {currency} {(price - discount).toFixed(2)}
          </div>
        )}

        {/* Countdown Timer for Flash Sales */}
        {getDealTypeSlug(dealType) === 'flash_sale' && endDate && Object.keys(timeLeft).length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200">
            <div className="flex items-center justify-center gap-2 text-red-700">
              <FaClock size={12} />
              <span className="text-xs font-bold">ENDS IN:</span>
              <span className="text-sm font-bold bg-red-600 text-white px-2 py-1 rounded">
                {timeLeft.hours?.toString().padStart(2, '0')}:
                {timeLeft.minutes?.toString().padStart(2, '0')}:
                {timeLeft.seconds?.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Expired Notice */}
        {getDealTypeSlug(dealType) === 'flash_sale' && endDate && Object.keys(timeLeft).length === 0 && (
          <div className="mt-3 p-3 bg-gray-100 border border-gray-300">
            <div className="text-xs text-gray-600 font-bold text-center uppercase">
              ⚠️ Deal Expired
            </div>
          </div>
        )}

        {/* Quick Action */}
        <div className="pt-2">
          <button className="w-full bg-black text-white py-2 text-sm font-semibold hover:bg-gray-800 transition-colors duration-200 uppercase tracking-wide">
            View Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealItem;