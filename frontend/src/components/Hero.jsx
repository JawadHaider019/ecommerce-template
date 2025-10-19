import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Link } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import axios from 'axios';

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - update this to match your backend URL
  const API_BASE_URL =  'http://localhost:4000/api';

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/banners/active`);
        
        if (response.data.success) {
          setBanners(response.data.data);
        } else {
          setError('Failed to fetch banners');
        }
      } catch (err) {
        setError('Error loading banners. Please try again later.');
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Custom Arrow Components
  const NextArrow = ({ onClick }) => (
    <button
      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-3 text-white transition hover:bg-opacity-75"
      onClick={onClick}
    >
      <IoIosArrowForward size={24} />
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button
      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-3 text-white transition hover:bg-opacity-75"
      onClick={onClick}
    >
      <IoIosArrowBack size={24} />
    </button>
  );

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    fade: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  // Loading state - matches original design
  if (loading) {
    return (
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">
        <div 
          className="relative flex h-[350px] items-center rounded-2xl md:h-[550px] bg-gray-200"
          style={{
                     backgroundSize: "cover",
                backgroundPosition: "center",
            borderRadius: "16px",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-40"></div>

          {/* Content */}
          <div className="relative z-10 max-w-lg px-14 text-left text-white">
            <div className="h-12 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-300 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - matches original design
  if (error) {
    return (
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">
        <div 
          className="relative flex h-[350px] items-center justify-center rounded-2xl md:h-[550px] bg-gray-200"
          style={{
            borderRadius: "16px",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-40"></div>

          {/* Content */}
          <div className="relative z-10 text-center text-white px-14">
            <p className="text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm font-medium transition hover:text-gray-300 md:text-base border border-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No banners state - matches original design
  if (banners.length === 0) {
    return (
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">
        <div 
          className="relative flex h-[350px] items-center justify-center rounded-2xl md:h-[550px] bg-gray-200"
          style={{
            borderRadius: "16px",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-40"></div>

          {/* Content */}
          <div className="relative z-10 text-center text-white px-14">
            <p className="text-lg">No banners available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner._id}>
            <div
              className="relative flex h-[350px] items-center rounded-2xl md:h-[550px]"
              style={{
                backgroundImage: `url(${banner.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "16px",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-40"></div>

              {/* Content */}
              <div className="relative z-10 lg:pl-20 px-14 text-left text-white">
                <h1 className="text-3xl font-bold leading-tight sm:py-3 sm:text-4xl lg:text-5xl">
                  {banner.headingLine1}
                  {banner.headingLine2 && (
                    <span className="block">{banner.headingLine2}</span>
                  )}
                </h1>
                {banner.subtext && (
                  <p className="mt-2 text-sm font-medium sm:text-base">
                    {banner.subtext}
                  </p>
                )}
                {banner.buttonText && banner.redirectUrl && (
                  <div className="mt-4 flex items-center gap-2">
                    <p className="h-px w-8 bg-white"></p>
                    <Link 
                      to={banner.redirectUrl}
                      className="text-sm font-medium transition hover:text-gray-300 md:text-base"
                    >
                      {banner.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Hero;