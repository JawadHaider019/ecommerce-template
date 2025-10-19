import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import Title from "./Title";
import { toast } from 'react-toastify';
import axios from 'axios';

const Deals = () => {
  const { backendUrl, addToCart, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch deals function
  const fetchDeals = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/deal/list`, {
        timeout: 10000,
      });
      
      if (response.data.success) {
        const dealsData = response.data.deals || [];
        return dealsData;
      } else {
        throw new Error(response.data.message || "Failed to fetch deals");
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);

        const dealsData = await fetchDeals();

        if (!dealsData || !Array.isArray(dealsData)) {
          setDeals([]);
          return;
        }

        // Filter active deals (published and within date range)
        const currentDate = new Date();
        const activeDeals = dealsData.filter((deal) => {
          const isPublished = deal.status === 'published';
          const hasStarted = !deal.dealStartDate || new Date(deal.dealStartDate) <= currentDate;
          const hasNotEnded = !deal.dealEndDate || new Date(deal.dealEndDate) >= currentDate;
          
          return isPublished && hasStarted && hasNotEnded;
        });

        setDeals(activeDeals);

      } catch (err) {
        console.error('Error in Deals component:', err);
        
        let errorMessage = "Failed to load deals";
        
        if (err.code === 'ECONNREFUSED') {
          errorMessage = "Cannot connect to server. Please check if the backend is running.";
        } else if (err.response) {
          errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
        } else if (err.request) {
          errorMessage = "No response from server. Please try again.";
        } else {
          errorMessage = err.message || "Failed to load deals";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [backendUrl]);

  const handleDealClick = (dealId) => {
    navigate(`/deal/${dealId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="border-t pt-14">
        <div className="mb-3 text-2xl">
          <Title text1={"HOT"} text2={"DEALS"} />
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500">Loading hot deals...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
    
      <div className="border-t pt-14">
        <div className="py-2 text-center text-3xl">
          <Title text1={"HOT"} text2={"DEALS"} />
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-2xl">
        <Title text1={"HOT"} text2={"DEALS"} />
      </div>
      
      {deals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No active deals available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {deals.map((deal) => (
            <DealItem
              key={deal._id || deal.id}
              deal={deal}
              currency={currency}
              onDealClick={handleDealClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Deal Item Component with same design as ProductItem
const DealItem = ({ deal, currency, onDealClick }) => {
  const handleClick = () => {
    onDealClick(deal._id || deal.id);
  };

  // Calculate discount percentage
  const calculateDiscountPercentage = () => {
    if (deal.dealTotal && deal.dealFinalPrice && deal.dealTotal > deal.dealFinalPrice) {
      return Math.round(((deal.dealTotal - deal.dealFinalPrice) / deal.dealTotal) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <div onClick={handleClick} className="cursor-pointer text-gray-700">
      <div className="relative overflow-hidden">
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-xs font-medium text-white">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Deal Type Badge */}
        <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
          {deal.dealType === 'flash_sale' ? 'Flash Sale' : 
           deal.dealType === 'bundle' ? 'Bundle' : 'Deal'}
        </div>

        <img
          className="transition ease-in-out hover:scale-110"
          src={deal.dealImages && deal.dealImages.length > 0 ? deal.dealImages[0] : "/images/fallback-image.jpg"}
          alt={deal.dealName}
          onError={(e) => {
            e.target.src = "/images/fallback-image.jpg";
          }}
        />
      </div>
      
      <p className="pb-1 pt-3 text-sm">{deal.dealName}</p>
      
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">
          {currency} {deal.dealFinalPrice?.toFixed(2) || '0.00'}
        </p>
        {deal.dealTotal && deal.dealTotal > deal.dealFinalPrice && (
          <p className="text-sm text-gray-500 line-through">
            {currency} {deal.dealTotal.toFixed(2)}
          </p>
        )}
      </div>

      {/* Products Count */}
      {deal.dealProducts && deal.dealProducts.length > 0 && (
        <div className="mt-1 flex items-center gap-1">
          <span className="text-xs text-gray-500">
            {deal.dealProducts.length} product{deal.dealProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Countdown Timer for Flash Sales */}
      {deal.dealType === 'flash_sale' && deal.dealEndDate && (
        <CompactCountdownTimer endDate={new Date(deal.dealEndDate)} />
      )}
    </div>
  );
};

// Compact Countdown Timer
const CompactCountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate - new Date();
      
      if (difference <= 0) {
        return {};
      }
      
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (Object.keys(timeLeft).length === 0) {
    return (
      <div className="mt-1 text-xs text-red-500">
        Expired
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
      <span>Ends in:</span>
      <span className="font-medium">
        {timeLeft.hours?.toString().padStart(2, '0')}:
        {timeLeft.minutes?.toString().padStart(2, '0')}:
        {timeLeft.seconds?.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default Deals;