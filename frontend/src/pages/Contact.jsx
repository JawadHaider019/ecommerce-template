import Title from '../components/Title';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faInstagram,
  faTiktok,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons';
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faUserCog
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Contact = () => {
  const [businessInfo, setBusinessInfo] = useState({
    company: {
      name: "Natura Bliss",
      tagline: "Pure Natural Skincare",
      description: "Pure, handmade natural skincare products crafted with organic ingredients for your wellness."
    },
    contact: {
      customerSupport: {
        email: "naturabliss@gmail.com",
        phone: "+92-317 5546007",
        hours: "24/7"
      }
    },
    location: {
      displayAddress: "123 Natural Street, Green Valley, PK",
      googleMapsLink: ""
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      tiktok: "",
      whatsapp: ""
    },
    multiStore: {
      enabled: false,
      stores: [],
      defaultStore: null
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch business details from backend
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        console.log('🔄 Fetching business details for contact page...');
        const response = await axios.get(`${backendUrl}/api/business-details`);

        if (response.data.success && response.data.data) {
          setBusinessInfo(response.data.data);
          console.log('✅ Business details loaded for contact page:', response.data.data);
        }
      } catch (error) {
        console.error('❌ Error fetching business details for contact page:', error);
      } finally {
        setLoading(false);
      }
    };

    if (backendUrl) {
      fetchBusinessDetails();
    } else {
      setLoading(false);
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  // Helper function to format operating hours (same as in admin)
  const formatOperatingHours = (operatingHours) => {
    if (!operatingHours) return "Not specified";
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const todayHours = operatingHours[today];
    
    if (todayHours?.closed) {
      return "Closed today";
    }
    
    if (todayHours?.open && todayHours?.close) {
      return `Today: ${todayHours.open} - ${todayHours.close}`;
    }
    
    return "Hours not set";
  };

  // Social media platforms configuration
  const socialPlatforms = [
    {
      key: 'facebook',
      icon: faFacebookF,
      label: 'Facebook',
      baseUrl: 'https://facebook.com/'
    },
    {
      key: 'instagram',
      icon: faInstagram,
      label: 'Instagram',
      baseUrl: 'https://instagram.com/'
    },
    {
      key: 'tiktok',
      icon: faTiktok,
      label: 'TikTok',
      baseUrl: 'https://tiktok.com/@'
    },
    {
      key: 'whatsapp',
      icon: faWhatsapp,
      label: 'WhatsApp',
      baseUrl: 'https://wa.me/'
    }
  ];

  // Get stores from business info or use default locations
  const stores = businessInfo.multiStore?.stores && businessInfo.multiStore.stores.length > 0
    ? businessInfo.multiStore.stores
    : [
        {
          storeId: 'default-1',
          storeName: 'Main Store',
          storeType: 'retail',
          location: {
            displayName: 'Talagang, Pakistan',
            address: {
              street: 'Talagang',
              city: 'Talagang',
              state: 'Punjab',
              zipCode: '00000'
            },
            googleMapsLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53581.37547067252!2d72.36579725668948!3d32.92893183501323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3920949ad1b6438b%3A0x7807a1c59442d6de!2sTalagang%2C%20Pakistan!5e0!3m2!1sen!2s!4v1742395541712!5m2!1sen!2s'
          },
          contact: {
            phone: '+92-317 5546007',
          },
          operatingHours: {
            monday: { open: "09:00", close: "18:00", closed: false },
            tuesday: { open: "09:00", close: "18:00", closed: false },
            wednesday: { open: "09:00", close: "18:00", closed: false },
            thursday: { open: "09:00", close: "18:00", closed: false },
            friday: { open: "09:00", close: "18:00", closed: false },
            saturday: { open: "09:00", close: "18:00", closed: false },
            sunday: { open: "09:00", close: "18:00", closed: true }
          },
          status: "active"
        }
      ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-300 w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="py-8 border-b border-gray-200">
        <div className="text-center">
          <div className="text-3xl">
            <Title text1={'GET IN'} text2={'TOUCH'} />
          </div>
          <p className="text-gray-600 text-base max-w-2xl mx-auto px-4">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content - Form with Sidebar */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Contact Form - 3 columns */}
          <div className="lg:col-span-3 p-4">
            <div className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Send Us a Message</h2>
                <p className="text-gray-600 mt-1">Fill out the form below and we'll get back to you soon</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-all bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-all bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-all bg-white"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="bulk-order">Bulk Order</option>
                      <option value="general">General Inquiry</option>
                      <option value="order-support">Order Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="suggestions">Suggestions</option>
                      <option value="partnership">Partnership</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="shipping-issues">Shipping & Delivery Issues</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us how we can help you..."
                    rows="5"
                    className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-all bg-white resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 px-6 font-semibold text-base hover:bg-gray-800 transition-all mt-4"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Contact Information - 1 column */}
          <div className="lg:col-span-1 p-4 border-l border-gray-200">
            <div className="bg-white p-4 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
                Contact Info
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-black w-9 h-9 flex items-center justify-center rounded-full">
                    <FontAwesomeIcon icon={faPhone} className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Phone</h4>
                    <p className="text-gray-600 text-sm mt-1">{businessInfo.contact?.customerSupport?.phone || "+92-317 5546007"}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-black w-9 h-9 flex items-center justify-center rounded-full">
                    <FontAwesomeIcon icon={faEnvelope} className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Email</h4>
                    <p className="text-gray-600 text-sm mt-1">{businessInfo.contact?.customerSupport?.email || "naturabliss@gmail.com"}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-black w-9 h-9 flex items-center justify-center rounded-full">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Address</h4>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      {businessInfo.location?.displayAddress || "123 Natural Street, Green Valley, PK"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Follow Us</h4>
                <div className="flex space-x-2">
                  {socialPlatforms.map((platform) => {
                    const socialUrl = businessInfo.socialMedia?.[platform.key];
                    const isActive = !!socialUrl;

                    return (
                      <a
                        key={platform.key}
                        href={isActive ? socialUrl : "#"}
                        target={isActive ? "_blank" : "_self"}
                        rel={isActive ? "noopener noreferrer" : ""}
                        className={`bg-black w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-gray-800 transition-all ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={platform.label}
                        title={isActive ? `Follow us on ${platform.label}` : `${platform.label} link not set`}
                        onClick={!isActive ? (e) => e.preventDefault() : undefined}
                      >
                        <FontAwesomeIcon icon={platform.icon} className="text-sm" />
                      </a>
                    );
                  })}
                </div>

                {/* Social Media Status */}
                <div className="mt-3 text-xs text-gray-500">
                  <p>
                    {Object.values(businessInfo.socialMedia || {}).filter(url => url).length > 0
                      ? "Connect with us on social media"
                      : "Social links coming soon"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Locations Section */}
      <div className="w-full py-8 border-t border-gray-200">
        <div className="w-full px-4">
          <div className="text-center mb-8">
            <div className="text-3xl">
              <Title text1={'OUR'} text2={'LOCATIONS'} />
            </div>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Visit our stores and facilities across multiple locations
            </p>
          </div>

          <div className={`w-full grid gap-6 ${stores.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
              stores.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                stores.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
                  stores.length >= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                    'grid-cols-1'
            }`}>
            {stores.map((store, index) => (
              <div key={store.storeId || index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="font-semibold text-gray-900 text-lg">{store.storeName}</h4>
                  {businessInfo.multiStore?.defaultStore === store.storeId && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Default Store
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    store.storeType === 'retail' ? 'bg-blue-100 text-blue-800' :
                    store.storeType === 'warehouse' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {store.storeType || 'store'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-600 mt-0.5 text-sm" />
                    <div>
                      <p className="text-gray-700 font-medium text-sm">{store.location?.displayName}</p>
                      {store.location?.address && (
                        <p className="text-gray-600 text-xs mt-1">
                          {store.location.address.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {store.contact?.phone && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faPhone} className="text-gray-600 text-sm" />
                      <p className="text-gray-600 text-sm">{store.contact.phone}</p>
                    </div>
                  )}

                  
                  

                  {store.operatingHours && (
                    <div className="flex items-center space-x-2 text-sm">
                      <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                      <span className="text-gray-600">{formatOperatingHours(store.operatingHours)}</span>
                    </div>
                  )}

                  {store.status && (
                    <div className="text-xs">
                      <span className={`px-2 py-1 rounded ${
                        store.status === 'active' ? 'bg-green-100 text-green-800' :
                        store.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  )}
                </div>

                {store.location?.googleMapsLink && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      title={`Location - ${store.storeName}`}
                      src={store.location.googleMapsLink}
                      width="100%"
                      height="150"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;