import { assets } from "../assets/assets";
import Title from './Title';

const WhyChooseUs = () => {
  return (
    <div className="py-12 sm:py-16 lg:py-20 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-4 sm:mb-6">
            <Title text1={'Why Choose'} text2={'Pure Clay'} />
          </div>
          <p className="text-gray-800 font-normal leading-relaxed text-base text-lg  max-w-4xl mx-auto px-4 sm:px-0">
            At Pure Clay, we believe true wellness starts with nature. Every product is made with care, honesty, and a deep respect for the earth. From sourcing pure ingredients to sustainable packaging, we stay committed to offering natural, wholesome, and chemical-free products — so your family can live healthier and happier every day.
          </p>
        </div>

        {/* Centered Landscape Image */}
        <div className="flex justify-center px-2 sm:px-0">
          <div className="w-full max-w-3xl">
            <img
              src={assets.whyus}
              alt="Pure Clay Natural Products"
              className="w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 object-cover border border-gray-200 rounded-3xl shadow-md sm:shadow-lg transition-all duration-300 hover:shadow-xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;