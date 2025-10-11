import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { bannerSlides } from "../assets/assets"; 
import { Link } from 'react-router-dom'; 

const Hero = () => {
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

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">
      <Slider {...settings}>
        {bannerSlides.map((slide) => (
          <div key={slide.id}>
            <div
              className="relative flex h-[350px] items-center rounded-2xl md:h-[550px]"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "16px",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-40"></div>

              {/* Content */}
              <div className="relative z-10 max-w-lg px-14 text-left text-white">
                <h1 className="text-3xl font-bold leading-tight sm:py-3 sm:text-4xl lg:text-5xl">
                  {slide.headline}
                </h1>
                <p className="mt-2 text-sm font-medium sm:text-base">
                  {slide.subheading}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <p className="h-px w-8 bg-white"></p>
                  
            <Link                  to={slide.ctaLink}
                    className="text-sm font-medium transition hover:text-gray-300 md:text-base"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Hero;
