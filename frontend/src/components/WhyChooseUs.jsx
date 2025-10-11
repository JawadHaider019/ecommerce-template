import { assets } from "../assets/assets";
import Title from './Title';
import { FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom'; 

const WhyChooseUs = () => {
  const keyPoints = [
    'Made with 100% natural ingredients.',
    'Free from harsh chemicals and artificial fragrances.',
    'Eco-friendly packaging to protect the planet.',
    'Suitable for all skin types, including sensitive skin.',
    'Handcrafted with love and care for the best results.',
  ];

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Large Image on the Left */}
          <div className="overflow-hidden rounded-lg shadow-lg">
            <img
              src={assets.whyus}
              alt="Natural Skincare Products"
              className="h-auto w-full object-cover"
            />
          </div>

          {/* Text on the Right */}
          <div className="space-y-6">
            <div className="text-2xl">
              <Title text1={"Why Choose"} text2={"Natura Bliss?"} />
            </div>

            <ul className="space-y-4">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start">
         
                  <FaCheck className="mr-3 mt-1 text-green-600" />
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>

    
            <Link
              to="/blog" 
              className="inline-block px-10 text-sm font-medium transition hover:text-gray-300 md:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;