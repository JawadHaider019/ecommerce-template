import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { FaStar } from 'react-icons/fa'; 
import { useRef } from "react";
import Title from '../components/Title';


const testimonials = [
    {
      name: "Emily R.",
      text: "Natura Bliss has completely transformed my skincare routine! The handmade soaps are gentle and smell amazing.",
      platform: "Instagram",
      rating: 5,
    },
    {
      name: "Mark T.",
      text: "I love that the products are eco-friendly and chemical-free. My skin has never felt better!",
      platform: "Facebook",
      rating: 4,
    },
    {
      name: "Sophia L.",
      text: "Their shampoo bar is a game changer! Highly recommended for anyone who wants natural hair care.",
      platform: "Twitter",
      rating: 5,
    },
  ];
const Testimonial = () => {

    const sliderRef = useRef(null);

    const sliderSettings = {
      dots: true,
      infinite: true,
      speed: 600,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      arrows: false,
      customPaging: () => (
        <div className="size-3 rounded-full bg-gray-300 transition-all duration-300 hover:bg-black"></div>
      ),
      dotsClass: "slick-dots flex justify-center gap-2 mt-4",
    };
  

  return (
    <div className="relative my-10 px-4 md:px-20 lg:px-40">
    <div className="text-center text-2xl">
      <Title text1={'CUSTOMER'} text2={'TESTIMONIALS'} />
    </div>

    {/* Navigation Buttons */}
    <button 
      className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gray-200 p-3 shadow-md transition duration-300 hover:bg-black"
      onClick={() => sliderRef.current.slickPrev()}
    >
      <IoIosArrowBack size={24} className="text-gray-700 hover:text-white" />
    </button>

    <Slider ref={sliderRef} {...sliderSettings}>
      {testimonials.map((testimonial, index) => (
        <div key={index} className="flex items-center justify-center">
          <div className="max-w-3xl rounded-lg bg-white p-8 text-center  transition duration-300 hover:scale-105">
            <p className="text-xl font-semibold text-gray-700">{testimonial.text}</p>
            <p className="mt-4 text-sm font-medium text-gray-600">- {testimonial.name}, via {testimonial.platform}</p>
            <div className="mt-2 flex justify-center">
              {[...Array(testimonial.rating)].map((_, i) => <FaStar key={i} className="size-5 text-yellow-500" />)}
            </div>
          </div>
        </div>
      ))}
    </Slider>

    <button 
      className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-3 shadow-md transition duration-300 hover:bg-black"
      onClick={() => sliderRef.current.slickNext()}
    >
      <IoIosArrowForward size={24} className="text-gray-700 hover:text-white" />
    </button>
  </div>
  )
}

export default Testimonial
