import Title from '../components/Title';
import { assets } from '../assets/assets';
import { FaLeaf, FaHands, FaShieldAlt, FaRecycle, FaQuoteLeft, FaSeedling, FaHeart, FaEye, FaAward, FaGem, FaSun } from 'react-icons/fa';
import Testimonial from '../components/Testimonial';
import NewsletterBox from '../components/NewsletterBox';
import { useState, useEffect } from 'react';

const About = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
     
      const response = await fetch(`${backendUrl}/api/teams`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team members: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const activeMembers = data.data
          .filter(member => member.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setTeamMembers(activeMembers);
      } else {
        throw new Error(data.message || 'Failed to fetch team members');
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.message);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <div className="bg-white">
      {/* Keep the existing banner section */}
      <div className="relative">
        <div className="-translate-y-16 md:-translate-y-[5.2rem] absolute inset-0 bg-black bg-opacity-40 z-10 rounded-3xl"></div>
        <img
          className="-translate-y-16 md:-translate-y-[5.2rem] w-full h-[90vh] object-cover rounded-3xl"
          src={assets.about_img}
          alt="All-Natural Skincare & Personal Care"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center -translate-y-10 justify-center text-center text-white px-4">
          <h1 className="lg:text-8xl text-7xl font-bold mb-6">
            PURE NATURE
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl leading-relaxed">
            Where Nature's Goodness Meets Your Life — Embracing Wholesome, Organic Living
          </p>
        </div>
      </div>

      {/* Our Philosophy - Modern Design */}
      <div className="pb-16 ">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
            </div>
            <div className="text-center text-4xl mb-6">
              <Title text1={'Our'} text2={'Philosophy'} />
            </div>
            <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed">
              True wellness comes from nature — not artificial additives. Pure ingredients for pure living.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed text-lg font-light">
                  We believe that true wellness comes from purity — not complexity. Every product, from oils to nuts, dates, and herbal teas, is crafted with care using 100% natural, plant-based ingredients.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg font-light">
                  Each item carries nature's goodness — cold-pressed oils, handpicked nuts, organic dates, and herbal infusions — selected for their <strong className="font-semibold text-black/90">nutritional value, flavor, and health benefits.</strong>
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
                <FaQuoteLeft className="text-black/30 text-3xl mb-4" />
                <p className="text-gray-800 italic text-xl leading-relaxed font-light">
                  "What nature provides is what truly nourishes and heals."
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed text-lg font-light">
                Our products aren't about luxury — they're about returning to what's real, wholesome, and good for your body. A gentle reminder that nature's wisdom is always the best choice for your health.
              </p>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={assets.about_img3}
                  alt="Natural Ingredients"
                  className="w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-sm text-gray-600 font-medium">
                    "Crafted with care, powered by nature's finest ingredients"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission - Centered Focus */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
             
            </div>
            <div className="text-center text-4xl mb-8">
              <Title text1={'Our'} text2={'Mission'} />
            </div>
          </div>
          
          <div className="bg-gray-100 p-12 rounded-3xl text-center border border-black/30 shadow-sm">
            <p className="text-gray-800 text-2xl leading-relaxed font-light italic">
              To create pure, carefully crafted, and sustainable organic products that nourish your body, respect our planet, and bring you closer to the wholesome goodness of nature.
            </p>
          </div>
        </div>
      </div>

      {/* Our Promise - Enhanced Cards */}
      <div className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
              
            </div>
            <div className="text-center text-4xl mb-6">
              <Title text1={'Our'} text2={'Promise'} />
            </div>
            <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed">
              Our commitment to purity, transparency, and your family's well-being
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaShieldAlt, title: "100% Natural", desc: "No preservatives, artificial flavors, or additives in any of our products.", color: "black" },
              { icon: FaSeedling, title: "Plant-Based", desc: "Made from wholesome, natural, and eco-friendly ingredients.", color: "black" },
              { icon: FaRecycle, title: "Sustainable", desc: "Eco-conscious packaging and responsibly sourced ingredients.", color: "black" },
              { icon: FaEye, title: "Transparency", desc: "You deserve to know exactly what goes into your food and wellness products.", color: "black" }
            ].map((item, index) => (
              <div 
                key={index}
                className ={`bg-white p-8 rounded-3xl text-center group hover:shadow-xl transition-all duration-500 border  border-${item.color}/50 hover:scale-105`}
              >
                <div className={`w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-${item.color}/50`}>
                  <item.icon className={`text-${item.color}-600 text-3xl`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-serif">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    
      {/* Meet the Team - Modern Layout */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
             
            </div>
            <div className="text-center text-4xl mb-6">
              <Title text1={'Meet'} text2={'Our Team'} />
            </div>
            <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed">
              The passionate team dedicated to bringing you nature's purest and healthiest products
            </p>
          </div>

          {error && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-3 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-red-600 text-sm">Unable to load team members: {error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse overflow-hidden">
                  <div className="h-80 w-full bg-gray-200"></div>
                  <div className="p-8">
                    <div className="h-7 bg-gray-200 rounded mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded mb-6 w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : teamMembers.length === 0 ? (
              <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-200 bg-white rounded-2xl">
                <div className="text-gray-300 text-6xl mb-6">👥</div>
                <h3 className="text-2xl font-semibold text-gray-400 mb-4">No Team Members Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">Our amazing team information will be displayed here soon.</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 group hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                      src={member.image?.url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">{member.name}</h3>
                    <div className="mb-6">
                      <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wide border-b border-emerald-200 pb-1">
                        {member.role}
                      </span>
                    </div>
                    {member.description && (
                      <p className="text-gray-600 leading-relaxed font-light text-sm">
                        {member.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Closing Signature */}
      <div className="max-w-2xl mx-auto px-6 py-20 text-center border-t border-gray-100">
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Thank you for choosing Pure Clay. We make natural products that are good for your body and bring the best of nature to your home.
        </p>
        <div className="border-t border-gray-100 pt-8">
          <p className="text-gray-900 font-serif text-2xl font-bold mb-2">With thanks,</p>
          <p className="text-gray-500 text-lg">The Pure Clay Team</p>
        </div>
      </div>

      <Testimonial />
      <NewsletterBox />
    </div>
  );
};

export default About;