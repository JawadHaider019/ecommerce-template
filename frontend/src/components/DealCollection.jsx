import { useContext, useState, useEffect, useMemo, useRef } from "react";
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

const DealCollection = () => {
  const { backendUrl, currency, deals: contextDeals } = useContext(ShopContext);
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealRatings, setDealRatings] = useState({});
  const sliderRef = useRef(null); // Added missing ref

  // Helper function to safely get deal type name
  const getDealTypeName = (dealType) => {
    return dealType;
  };

  // Fetch deals function
  const fetchDeals = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/deal/list`, {
        timeout: 10000,
      });
      if (response.data.success) {
        return response.data.deals || [];
      } else {
        throw new Error(response.data.message || "Failed to fetch deals");
      }
    } catch (error) {
      throw error;
    }
  };

  // Fetch ratings for each deal
  const fetchDealRatings = async (dealId) => {
    try {
      const response = await fetch(`${backendUrl}/api/comments?dealId=${dealId}`);
      if (response.ok) {
        const comments = await response.json();
        
        if (comments.length > 0) {
          const totalRating = comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
          const averageRating = totalRating / comments.length;
          return averageRating;
        }
      }
      return 0;
    } catch (error) {
      return 0;
    }
  };

  // Use useMemo to filter and process deals
  const processedDeals = useMemo(() => {
    if (!deals || !Array.isArray(deals)) return [];

    // Filter active deals
    const currentDate = new Date();
    const activeDeals = deals.filter((deal) => {
      const isPublished = deal.status === 'published';
      const hasStarted = !deal.dealStartDate || new Date(deal.dealStartDate) <= currentDate;
      const hasNotEnded = !deal.dealEndDate || new Date(deal.dealEndDate) >= currentDate;
      return isPublished && hasStarted && hasNotEnded;
    });

    // Remove duplicate deals by ID
    const uniqueDeals = activeDeals.filter((deal, index, self) =>
      index === self.findIndex(d => (d._id || d.id) === (deal._id || deal.id))
    );

    // Limit to 15 deals for better slider experience
    return uniqueDeals.slice(0, 15);
  }, [deals]);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const dealsData = await fetchDeals();
        setDeals(dealsData);

        // Fetch ratings for each deal
        if (dealsData && Array.isArray(dealsData)) {
          const ratings = {};
          for (const deal of dealsData.slice(0, 15)) {
            const dealId = deal._id || deal.id;
            if (dealId) {
              const rating = await fetchDealRatings(dealId);
              ratings[dealId] = rating;
            }
          }
          setDealRatings(ratings);
        }

      } catch (err) {
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

  // Calculate grid columns for non-slider view (when less than 3 deals)
  const getGridColumns = () => {
    const count = processedDeals.length;
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto";
    if (count === 4) return "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  };

  // Slick Slider settings - Show 3 deals
  const sliderSettings = {
    dots: true,
    infinite: processedDeals.length >= 3,
    speed: 500,
    slidesToShow: Math.min(3, processedDeals.length),
    slidesToScroll: 1,
    autoplay: processedDeals.length >= 3,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false, // Disable Slick's default arrows completely
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(3, processedDeals.length),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, processedDeals.length),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, processedDeals.length),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: processedDeals.length > 1
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

  // Show slider only if we have at least 3 deals
  const showSlider = processedDeals.length >= 3;

  if (loading) {
    return (
      <div className="my-24">
        <div className="py-2 text-center text-3xl">
          <Title text1={'HOT'} text2={'DEALS'} />
        </div>
        <div className="text-center text-gray-500 py-8">
          Loading hot deals...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-24">
        <div className="py-8 text-center text-3xl">
          <Title text1={'HOT'} text2={'DEALS'} />
          <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
            Discover our exclusive limited-time offers with great discounts.
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
        <Title text1={'HOT'} text2={'DEALS'} />
      </div>

      {processedDeals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No active deals available at the moment.
        </div>
      ) : showSlider ? (
        // Show slider when we have 3 or more deals
        <div className="relative px-4">
          <Slider ref={sliderRef} {...sliderSettings}>
            {processedDeals.map((deal) => (
              <div key={deal._id || deal.id} className="px-2">
                <DealItem
                  id={deal._id || deal.id}
                  image={deal.dealImages && deal.dealImages.length > 0 ? deal.dealImages[0] : "/images/fallback-image.jpg"}
                  name={deal.dealName}
                  price={deal.dealTotal || 0}
                  discount={deal.dealFinalPrice || 0}
                  rating={dealRatings[deal._id || deal.id] || 0}
                  dealType={getDealTypeName(deal.dealType)}
                  productsCount={deal.dealProducts ? deal.dealProducts.length : 0}
                  endDate={deal.dealEndDate}
                  onDealClick={handleDealClick}
                  currency={currency}
                />
              </div>
            ))}
          </Slider>
          
          {/* Add custom arrows outside the slider */}
          {processedDeals.length >= 3 && (
            <>
              <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
              <NextArrow onClick={() => sliderRef.current?.slickNext()} />
            </>
          )}
        </div>
      ) : (
        // Show regular grid when we have 1-2 deals - using the same grid system as RelatedDeals
        <div className={`grid ${getGridColumns()} gap-4 gap-y-6 px-4`}>
          {processedDeals.map((deal) => (
            <DealItem
              key={deal._id || deal.id}
              id={deal._id || deal.id}
              image={deal.dealImages && deal.dealImages.length > 0 ? deal.dealImages[0] : "/images/fallback-image.jpg"}
              name={deal.dealName}
              price={deal.dealTotal || 0}
              discount={deal.dealFinalPrice || 0}
              rating={dealRatings[deal._id || deal.id] || 0}
              dealType={getDealTypeName(deal.dealType)}
              productsCount={deal.dealProducts ? deal.dealProducts.length : 0}
              endDate={deal.dealEndDate}
              onDealClick={handleDealClick}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DealCollection;