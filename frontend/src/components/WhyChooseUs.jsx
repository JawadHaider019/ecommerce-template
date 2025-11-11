import { useMemo } from "react";
import { assets } from "../assets/assets";
import Title from './Title';

const WhyChooseUs = () => {
  // Memoized image component to prevent unnecessary re-renders
  const CenteredImage = useMemo(() => {
    const handleImageError = (e) => {
      e.target.style.display = 'none';
      // Use standard optional chaining without assignment
      const nextSibling = e.target.nextSibling;
      if (nextSibling) {
        nextSibling.style.display = 'block';
      }
    };

    return (
      <div className="flex justify-center px-2 sm:px-0">
        <div className="w-full max-w-3xl">
          <img
            src={assets.whyus}
            alt="Pure Clay Natural Products - Organic and chemical-free wellness products"
            className="w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 object-cover border border-gray-200 rounded-3xl shadow-md sm:shadow-lg transition-all duration-300 hover:shadow-xl"
            loading="lazy"
            decoding="async"
            width={800}
            height={400}
            onError={handleImageError}
          />
          {/* Fallback placeholder - hidden by default */}
          <div 
            className="hidden w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 bg-gradient-to-r from-green-50 to-emerald-100 border border-gray-200 rounded-3xl shadow-md sm:shadow-lg flex items-center justify-center"
          >
            <div className="text-center text-gray-600">
              <div className="text-lg font-semibold mb-2">Pure Clay Products</div>
              <div className="text-sm">Natural & Organic Wellness</div>
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  // Memoized description text
  const descriptionText = useMemo(() => (
    <p className="text-gray-800 font-normal leading-relaxed text-base text-lg max-w-4xl mx-auto px-4 sm:px-0">
      At Pure Clay, we believe true wellness starts with nature. Every product is made with care, honesty, and a deep respect for the earth. From sourcing pure ingredients to sustainable packaging, we stay committed to offering natural, wholesome, and chemical-free products — so your family can live healthier and happier every day.
    </p>
  ), []);

  return (
    <section 
      className="py-12 sm:py-16 lg:py-20 border-y border-gray-200"
      aria-labelledby="why-choose-us-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-4 sm:mb-6">
            <Title text1={'Why Choose'} text2={'Pure Clay'} />
          </div>
          {descriptionText}
        </div>

        {/* Centered Landscape Image */}
        {CenteredImage}
      </div>
    </section>
  );
};

export default WhyChooseUs;