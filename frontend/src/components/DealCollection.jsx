import { useContext, useState, useEffect, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import Title from './Title';
import DealItem from "./DealItem.jsx";
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa';

const DealCollection = () => {
  const { backendUrl, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealRatings, setDealRatings] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Number of items to show per slide based on screen size
  const getItemsPerSlide = () => {
    if (typeof window === 'undefined') return 5;
    const width = window.innerWidth;
    if (width < 640) return 2; // mobile
    if (width < 768) return 3; // small tablet
    if (width < 1024) return 4; // tablet
    return 5; // desktop
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

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
      console.error('Error fetching deals:', error);
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
      console.error('Error fetching ratings for deal:', dealId, error);
      return 0;
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

        // Filter active deals
        const currentDate = new Date();
        const activeDeals = dealsData.filter((deal) => {
          const isPublished = deal.status === 'published';
          const hasStarted = !deal.dealStartDate || new Date(deal.dealStartDate) <= currentDate;
          const hasNotEnded = !deal.dealEndDate || new Date(deal.dealEndDate) >= currentDate;
          return isPublished && hasStarted && hasNotEnded;
        });

        // Limit to 15 deals for better slider experience
        const limitedDeals = activeDeals.slice(0, 15);
        setDeals(limitedDeals);

        // Fetch ratings for each deal
        const ratings = {};
        for (const deal of limitedDeals) {
          const dealId = deal._id || deal.id;
          if (dealId) {
            const rating = await fetchDealRatings(dealId);
            ratings[dealId] = rating;
          }
        }
        setDealRatings(ratings);

      } catch (err) {
        console.error('Error in DealCollection component:', err);
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

  // Handle window resize for responsive items per slide
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
      setCurrentSlide(0); // Reset to first slide on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || deals.length === 0) return;

    const totalSlides = Math.ceil(deals.length / itemsPerSlide);
    
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000); // Change slide every 4 seconds

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, deals.length, itemsPerSlide]);

  const totalSlides = Math.ceil(deals.length / itemsPerSlide);
  const visibleDeals = deals.slice(currentSlide * itemsPerSlide, (currentSlide + 1) * itemsPerSlide);

  const handleDealClick = (dealId) => {
    navigate(`/deal/${dealId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="my-10">
        <div className="py-8 text-center text-3xl">
          <Title text1={'HOT'} text2={'DEALS'} />
          <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
            Discover our exclusive limited-time offers with great discounts
          </p>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500">Loading hot deals...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-10">
        <div className="py-8 text-center text-3xl">
          <Title text1={'HOT'} text2={'DEALS'} />
          <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
            Discover our exclusive limited-time offers with great discounts
          </p>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="py-8 text-center text-3xl">
        <Title text1={'HOT'} text2={'DEALS'} />
        <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
          Discover our exclusive limited-time offers with great discounts and special bundles
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No active deals available at the moment.
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 lg:px-8">
          {/* Slider Container */}
          <div 
            ref={sliderRef}
            className="relative overflow-hidden"
          >
            {/* Slider Track */}
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / itemsPerSlide)}%)`
              }}
            >
              {deals.map((deal) => (
                <div 
                  key={deal._id || deal.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / itemsPerSlide}%` }}
                >
                  <DealItem
                    id={deal._id || deal.id}
                    image={deal.dealImages && deal.dealImages.length > 0 ? deal.dealImages[0] : "/images/fallback-image.jpg"}
                    name={deal.dealName}
                    price={deal.dealTotal || 0}
                    discount={deal.dealFinalPrice || 0}
                    rating={dealRatings[deal._id || deal.id] || 0}
                    dealType={deal.dealType}
                    productsCount={deal.dealProducts ? deal.dealProducts.length : 0}
                    endDate={deal.dealEndDate}
                    onDealClick={handleDealClick}
                    currency={currency}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-1 top-[100px] transform -translate-y-1/2 bg-black hover:bg-white text-gray-300 rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                aria-label="Previous slide"
              >
                <FaChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-1 top-[100px] transform -translate-y-1/2 bg-black hover:bg-white text-gray-300 rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                aria-label="Next slide"
              >
                <FaChevronRight size={18} />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              {/* Auto-play toggle */}
          

              {/* Slide dots */}
              <div className="flex space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-black scale-1' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DealCollection;