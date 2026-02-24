import { useMemo, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import Title from './Title';

const WhyChooseUs = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Pre-calculate fixed heights for each breakpoint
  const imageHeights = {
    base: '192px',    // h-48
    xs: '224px',      // xs:h-56
    sm: '256px',      // sm:h-64
    md: '288px',      // md:h-72
    lg: '320px',      // lg:h-80
    xl: '384px'       // xl:h-96
  };

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.src = assets.whyus;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
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

        {/* Centered Landscape Image - With FIXED dimensions */}
        <div className="flex justify-center px-2 sm:px-0">
          <div className="w-full max-w-3xl">
            {/* Container with fixed aspect ratio */}
            <div 
              className="relative w-full overflow-hidden rounded-3xl shadow-md sm:shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{ 
                aspectRatio: '16/9',
                backgroundColor: '#f9fafb' // Light gray placeholder
              }}
            >
              {/* Loading placeholder */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
              )}
              
              {/* Actual Image */}
              {(imageLoaded || !imageError) && (
                <img
                  src={assets.whyus}
                  alt="Pure Clay Natural Products - Organic and chemical-free wellness products"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={450} // 16:9 ratio
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}

              {/* Error fallback - always same size */}
              {imageError && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-100 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <div className="text-lg font-semibold mb-2">Pure Clay Products</div>
                    <div className="text-sm">Natural & Organic Wellness</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;