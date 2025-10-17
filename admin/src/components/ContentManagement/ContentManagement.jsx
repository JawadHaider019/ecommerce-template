import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder, 
  faComment, 
  faBookOpen, 
  faReply,
  faCog,
  faImages
} from '@fortawesome/free-solid-svg-icons';

// Import tab components
import CategoriesTab from './Tabs/CategoriesTab.jsx';
import TestimonialsTab from './Tabs/TestimonialsTab.jsx';
import BlogsTab from './Tabs/BlogsTab.jsx';
import CommentsTab from './Tabs/CommentsTab.jsx';
import OtherTab from './Tabs/OtherTab.jsx';
import { BannerManager } from './Tabs/BannerTab.jsx';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('categories');

  // States for tabs
  const [categories, setCategories] = useState([
    { id: 1, name: 'Skincare', subcategories: [{ id: 101, name: 'Face Care' }, { id: 102, name: 'Body Care' }] },
    { id: 2, name: 'Haircare', subcategories: [{ id: 201, name: 'Shampoos' }, { id: 202, name: 'Conditioners' }] },
    { id: 3, name: 'Bodycare', subcategories: [] }
  ]);

  const [testimonials, setTestimonials] = useState([
    { id: 1, name: 'Priya Sharma', content: 'These products transformed my skin!', rating: 5, status: 'approved' },
    { id: 2, name: 'Rahul Verma', content: 'Good quality but delivery was late', rating: 4, status: 'pending' }
  ]);

  const [blogs, setBlogs] = useState([
    { id: 1, title: 'Benefits of Natural Skincare', category: 'Skincare', subcategory: 'Face Care', date: '2024-01-15', status: 'published', comments: 8, content: 'Full blog content...', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'How to Take Care of Oily Hair', category: 'Haircare', subcategory: 'Shampoos', date: '2024-01-10', status: 'draft', comments: 0, content: 'Full blog content...', videoUrl: '' }
  ]);

  // Realistic comments data with multiple images and authentic content
  const [comments, setComments] = useState([
    {
      id: 1,
      productName: "Organic Lavender Soap Collection",
      productImages: [
        "https://images.unsplash.com/photo-1549989476-69a92fa57c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c29hcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1558640476-437a2e94348a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNvYXB8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1594736797933-d0c64a0b643f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNvYXB8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "8.99",
      type: "product",
      author: "Sarah Johnson",
      email: "sarah@example.com",
      content: "The lavender scent is absolutely divine! My skin has never felt softer. I love how it doesn't dry out my skin like other soaps do. Will definitely repurchase! I've attached photos of how beautiful the soaps look in my bathroom.",
      rating: 5,
      date: "2024-01-15T14:30:00Z",
      isRead: false,
      hasReply: false,
      reply: null
    },
    {
      id: 2,
      productName: "Summer Skincare Bundle",
      productImages: [
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2tpbmNhcmUlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNrbmNhcmUlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHNrbmNhcmUlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "49.99",
      type: "deal",
      author: "Mike Chen",
      email: "mike@example.com",
      content: "Is this bundle available for international shipping to Canada? How long does shipping usually take and what are the customs charges like? The products look amazing in the photos!",
      rating: 4,
      date: "2024-01-14T09:15:00Z",
      isRead: true,
      hasReply: true,
      reply: {
        content: "Yes, we ship to Canada! Shipping typically takes 7-10 business days. Customs charges vary by location but are usually around 10-15% of the order value. We're glad you like our products!",
        date: "2024-01-14T16:20:00Z",
        author: "Admin"
      }
    },
    {
      id: 3,
      productName: "Anti-Aging Face Cream & Serum Set",
      productImages: [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGZhY2UlMjBjcmVhbXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1591369822096-ffd140ec946f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2VydW18ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c2tpbmNhcmUlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "32.50",
      type: "product",
      author: "Emma Davis",
      email: "emma@example.com",
      content: "After using this cream and serum set for just 3 weeks, I've noticed my fine lines around the eyes have significantly reduced. The texture is luxurious and it absorbs quickly without feeling greasy. The packaging is also very elegant!",
      rating: 5,
      date: "2024-01-13T18:45:00Z",
      isRead: false,
      hasReply: false,
      reply: null
    },
    {
      id: 4,
      productName: "Charcoal & Clay Face Mask Duo",
      productImages: [
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZhY2UlMjBtYXNrfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1594736797933-d0c64a0b643f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZhY2UlMjBtYXNrfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFjZSUyMG1hc2t8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "18.99",
      type: "product",
      author: "David Wilson",
      email: "david@example.com",
      content: "The charcoal mask works really well for my oily skin - it leaves my face feeling clean and refreshed. The clay mask is also great for occasional deep cleaning. However, the packaging could be more sturdy as the jar arrived with a small crack.",
      rating: 3.5,
      date: "2024-01-12T11:20:00Z",
      isRead: true,
      hasReply: false,
      reply: null
    },
    {
      id: 5,
      productName: "Argan Oil Hair Care Collection",
      productImages: [
        "https://images.unsplash.com/photo-1591369822096-ffd140ec946f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFpciUyMHNlcnVtfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1552902865-b72f031c5d12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhhcmlyJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGhhcmlyJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "24.99",
      type: "product",
      author: "Priya Patel",
      email: "priya@example.com",
      content: "This hair care collection has completely transformed my frizzy hair! The serum, shampoo, and conditioner work perfectly together. Just a few drops of serum and my hair looks shiny and manageable all day. The scent is also very pleasant and not overpowering.",
      rating: 5,
      date: "2024-01-11T16:30:00Z",
      isRead: false,
      hasReply: true,
      reply: {
        content: "We're thrilled to hear about your positive experience with our Argan Oil Hair Care Collection! Thank you for sharing your detailed feedback and photos.",
        date: "2024-01-11T18:45:00Z",
        author: "Admin"
      }
    },
    {
      id: 6,
      productName: "Body Lotion & Scrub Collection",
      productImages: [
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Ym9keSUyMGxvdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJvZHklMjBzY3J1YnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1558640476-437a2e94348a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJvZHklMjBjYXJlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "35.00",
      type: "product",
      author: "Maria Garcia",
      email: "maria@example.com",
      content: "I bought this collection for my dry skin and it's been amazing! The lotions are rich but not heavy, and they absorb quickly. The body scrub is gentle yet effective. My favorite is the coconut scent - it makes my whole bathroom smell tropical!",
      rating: 4.5,
      date: "2024-01-10T13:15:00Z",
      isRead: true,
      hasReply: false,
      reply: null
    },
    {
      id: 7,
      productName: "Benefits of Natural Skincare",
      productImages: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxvZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmxvZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "0.00",
      type: "blog",
      author: "Neha Patel",
      email: "neha@example.com",
      content: "This article was incredibly informative! I've been considering switching to natural skincare and your detailed explanations about the benefits convinced me to make the change. The before-and-after photos in the article were particularly convincing. When will you write about specific routines for dry skin?",
      rating: null,
      date: "2024-01-16T10:30:00Z",
      isRead: false,
      hasReply: false,
      reply: null
    },
    {
      id: 8,
      productName: "Essential Oil Wellness Set",
      productImages: [
        "https://images.unsplash.com/photo-1603712610496-5362a2c93c88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZXNzZW50aWFsJTIwb2lsfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1558640476-437a2e94348a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVzc2VudGlhbCUyMG9pbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1591369822096-ffd140ec946f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXNzZW50aWFsJTIwb2lsJTIwc2V0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ],
      productPrice: "29.99",
      type: "product",
      author: "James Wilson",
      email: "james@example.com",
      content: "The diffuser works great and creates a wonderful ambiance in my home office. The essential oil blends are high quality and the scents are authentic. However, I wish the LED light colors could be adjusted separately from the mist settings. The packaging was beautiful though!",
      rating: 4,
      date: "2024-01-18T11:45:00Z",
      isRead: false,
      hasReply: false,
      reply: null
    }
  ]);

  const [deliverySettings, setDeliverySettings] = useState({ mode: "fixed", fixedCharge: 0, apiUrl: "", freeDeliveryAbove: 0 });
  const [selectedImage, setSelectedImage] = useState(null);
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      previewUrlsRef.current = [];
    };
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoriesTab categories={categories} setCategories={setCategories} />;
      case 'blogs':
        return <BlogsTab blogs={blogs} setBlogs={setBlogs} categories={categories} />;
      case 'banner':
        return <BannerManager />;
      case 'testimonials':
        return <TestimonialsTab testimonials={testimonials} setTestimonials={setTestimonials} />;
      case 'comments':
        return <CommentsTab comments={comments} setComments={setComments} />;
      case 'other':
        return <OtherTab deliverySettings={deliverySettings} setDeliverySettings={setDeliverySettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100 mt-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Content Management</h2>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        {[
          { id: 'categories', name: 'Categories', icon: faFolder },
          { id: 'blogs', name: 'Blogs', icon: faBookOpen },
          { id: 'banner', name: 'Banner', icon: faImages },
          { id: 'testimonials', name: 'Testimonials', icon: faComment },
          { id: 'comments', name: 'Comments', icon: faReply },
          { id: 'other', name: 'Other', icon: faCog }
        ].map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium flex items-center ${activeTab === tab.id ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} className="mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default ContentManagement;