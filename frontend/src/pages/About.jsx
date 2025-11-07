import Title from '../components/Title';
import { assets } from '../assets/assets';
import { FaLeaf, FaHands, FaShieldAlt, FaRecycle, FaQuoteLeft, FaSeedling, FaHeart, FaEye } from 'react-icons/fa'; 
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
    <div className="border-t pt-14">
      {/* Magazine Cover Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <img
          className="w-full h-[70vh] object-cover"
          src={assets.about_img}
          alt="All-Natural Skincare & Personal Care"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-oswald lg:text-8xl text-7xl font-serif font-bold mb-6 tracking-tight">
            PURE <span className="text-oswald text-holo">NATURE</span>
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl leading-relaxed">
Where Nature's Goodness Meets Your Life" — Embracing Wholesome, Organic Living
          </p>
        
        </div>
      </div>


      {/* <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-block border-b-2 border-green-700 pb-2 mb-8">
            <span className="text-sm font-semibold text-green-700 uppercase tracking-widest">Featured Story</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            The Story Behind Our All-Natural Skincare Journey
          </h2>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500 mb-8">
            <span>FEATURE</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>ORGANIC SKINCARE</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>NATURAL BEAUTY</span>
          </div>
        </div>

      
        <div className="prose prose-lg max-w-none">
        
          <div className="flex mb-8">
            <div className="text-6xl md:text-7xl font-serif font-bold text-green-700 float-left mr-4 mt-2 leading-none">F</div>
            <p className="text-gray-700 text-lg leading-relaxed">
              or years, we searched for skincare products that were truly natural — cleansers, moisturizers, and treatments that were free from harsh chemicals and gentle enough for daily use. But every time we read the ingredients behind so-called "organic" and "gentle" products, the truth was disappointing — artificial fragrances, preservatives, and harsh synthetics hiding behind beautiful labels.
            </p>
          </div>

    
          <div className="my-12 p-8 bg-gray-100 border-l-4 border-green-500">
            <FaQuoteLeft className="text-green-400 text-2xl mb-4" />
            <p className="text-gray-700 italic text-xl leading-relaxed font-light">
              "We knew there had to be a better way — something real, pure, and honest. So, we began to experiment."
            </p>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">
            From <strong>charcoal for deep cleansing</strong> and <strong>botanical extracts for purification</strong>, to <strong>nourishing plant oils</strong> and <strong>herbal infusions for healing</strong>, we tested, refined, and perfected — until we discovered the perfect balance between nature's wisdom and skincare science.
          </p>

          <div className="grid md:grid-cols-2 gap-12 my-16">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 pb-3 border-b">Our Founding Belief</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                And that's how our journey began — not from a business plan, but from a heartfelt conviction:
                <br />
                <em className="text-green-700">"To protect skin from harmful chemicals and reconnect it with nature's healing touch."</em>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, we stand proudly as a dedicated natural skincare brand, creating <strong>pure, handcrafted, and chemical-free</strong> products designed to nourish, protect, and enhance your skin's natural radiance and overall well-being.
              </p>
            </div>
            <div className="bg-gray-100 p-8 border border-green-200">
              <FaQuoteLeft className="text-green-400 text-3xl mb-4" />
              <p className="text-gray-700 italic text-lg leading-relaxed">
                "What nature creates is what's best for your skin. Your skin's true companion is nature — and we're here to help you rediscover that connection."
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Our Philosophy - Magazine Feature */}
      <div className="bg-gray-50 py-20 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-center text-3xl">
              <Title text1={'OUR'} text2={'PHILOSOPHY'} />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">True wellness comes from nature — not artificial additives</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
We believe that true wellness comes from purity — not complexity. Every product, from oils to nuts, dates, and herbal teas, is crafted with care using 100% natural, plant-based ingredients.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
              Each item carries nature’s goodness — cold-pressed oils, handpicked nuts, organic dates, and herbal infusions — selected for their <strong >nutritional value, flavor, and health benefits.</strong>
              </p>
              <blockquote className="text-xl font-serif text-gray-800 italic leading-relaxed border-l-4 border-green-500 pl-6 py-4">
              "What nature provides is what truly nourishes and heals."
              </blockquote>
              <p className="text-gray-700 leading-relaxed mt-6">
Our products aren’t about luxury — they’re about returning to what’s real, wholesome, and good for your body. A gentle reminder that nature’s wisdom is always the best choice for your health.
              </p>
            </div>
            <div className="relative">
              <img
                src={assets.about_img3}
                alt="Natural Skincare Ingredients"
                className="w-full h-96 object-cover border border-gray-200"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 border border-gray-200 max-w-xs">
                <p className="text-sm text-gray-600 italic">
                "Crafted with care, powered by nature’s finest ingredients"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center text-3xl">
            <Title text1={'OUR'} text2={'MISSION'} />
          </div>
          
          <div className="bg-white p-8 text-center">
            <p className="text-gray-700 text-xl leading-relaxed font-light italic">
            To create pure, carefully crafted, and sustainable organic products that nourish your body, respect our planet, and bring you closer to the wholesome goodness of nature.
            </p>
          </div>
        </div>
      </div>

      {/* Our Promise - Magazine Feature */}
      <div className="bg-white py-20 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-center text-3xl">
              <Title text1={'OUR'} text2={'PROMISE'} />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">Our commitment to purity, transparency, and your family’s well-being</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <FaShieldAlt className="text-green-700 text-2xl" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">100% Natural</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
              No preservatives, artificial flavors, or additives in any of our products.
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <FaSeedling className="text-green-700 text-2xl" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Plant-Based</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
               Made from wholesome, natural, and eco-friendly ingredients.
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <FaRecycle className="text-green-700 text-2xl" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Sustainable </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
             Eco-conscious packaging and responsibly sourced ingredients.
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <FaEye className="text-green-700 text-2xl" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
        You deserve to know exactly what goes into your food and wellness products every day.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Movement Section - Full Width Banner */}
      {/* <div className="bg-green-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">A Movement Toward Clean Skincare</h2>
          <p className="text-xl leading-relaxed mb-8 opacity-90 max-w-3xl mx-auto">
            This isn't just skincare — it's a movement. A movement for clean, honest, and effective self-care. When you choose natural skincare, you choose to protect your skin, cherish our planet, and celebrate beauty in its truest, most natural form.
          </p>
          <div className="w-24 h-1 bg-green-300 mx-auto mb-8"></div>
          <p className="text-2xl opacity-90 font-light">
            Welcome to a world where nature nurtures your skin. 🌿✨
          </p>
        </div>
      </div> */}

      {/* Why Choose Us - Magazine Feature */}
  {/* Why Choose Us - Magazine Feature */}
<div className="py-20 border-y border-gray-200">
  <div className="max-w-6xl mx-auto px-6">
    <div className="text-center mb-16">
      <div className="text-center text-3xl">
        <Title text1={'WHY CHOOSE'} text2={'PURE CLAY'} />
      </div>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Experience the difference of truly natural and wholesome products
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
          <FaLeaf className="text-green-700 text-2xl" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Natural Ingredients</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Pure, natural ingredients free from preservatives, chemicals, and artificial additives.
        </p>
      </div>

      <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
          <FaHands className="text-orange-500 text-2xl" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Carefully Crafted</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Each product is thoughtfully prepared to preserve natural goodness and nutritional value.
        </p>
      </div>

      <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
          <FaShieldAlt className="text-blue-500 text-2xl" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Safe & Healthy</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Wholesome products suitable for daily consumption by the whole family.
        </p>
      </div>

      <div className="bg-white p-8 border border-gray-200 text-center group hover:border-green-300 transition-colors">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
          <FaHeart className="text-purple-500 text-2xl" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Trusted Quality</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Experience the wholesome goodness of nature with products you can trust every day.
        </p>
      </div>
    </div>
  </div>
</div>


      {/* Meet the Team - Magazine Style */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block border-b-2 border-gray-300 pb-2 mb-4">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">The People Behind</span>
            </div>
            <div className="text-center text-3xl">
              <Title text1={'MEET'} text2={'OUR TEAM'} />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">The passionate team dedicated to bringing you nature’s purest and healthiest products.</p>
          </div>

          {error && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200">
                <span className="text-red-600 text-sm">Unable to load team members: {error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 animate-pulse">
                  <div className="h-80 w-full bg-gray-300"></div>
                  <div className="p-6 border-t border-gray-100">
                    <div className="h-7 bg-gray-300 mb-3"></div>
                    <div className="h-5 bg-gray-300 mb-4 w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300"></div>
                      <div className="h-3 bg-gray-300"></div>
                      <div className="h-3 bg-gray-300 w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : teamMembers.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-gray-200 bg-gray-50">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Team Members Yet</h3>
                <p className="text-gray-500">Our amazing team information will be displayed here soon.</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member._id} className="bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                      src={member.image?.url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
                      }}
                    />
                  </div>
                  <div className="p-6 border-t border-gray-100 text-center">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{member.name}</h3>
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-green-700 uppercase tracking-wide border-b border-green-200 pb-1">
                        {member.role}
                      </span>
                    </div>
                    {member.description && (
                      <p className="text-gray-600 text-sm leading-relaxed font-light">
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
<div className="max-w-2xl mx-auto px-6 py-16 text-center border-t border-gray-200">
  <p className="text-gray-600 text-lg mb-8">
    Thank you for choosing Pure Clay. We make natural products that are good for your body and bring the best of nature to your home.
  </p>
  <div className="border-t border-gray-200 pt-8">
    <p className="text-gray-900 font-serif text-xl font-bold">With thanks,</p>
    <p className="text-gray-600">The Pure Clay Team</p>
  </div>
</div>



      <Testimonial />
      <NewsletterBox />
    </div>
  );
};

export default About;