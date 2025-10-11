import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder, 
  faComment, 
  faBookOpen, 
  faReply,
  faCog
} from '@fortawesome/free-solid-svg-icons';

// Import the new components
import CategoriesTab from './Tabs/CategoriesTab.jsx';
import TestimonialsTab from './Tabs/TestimonialsTab.jsx';
import BlogsTab from './Tabs/BlogsTab.jsx';
import CommentsTab from './Tabs/CommentsTab.jsx';
import OtherTab from './Tabs/OtherTab.jsx';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('categories');
  
  // State management for all tabs
  const [categories, setCategories] = useState([
    { 
      id: 1, 
      name: 'Skincare', 
      subcategories: [
        { id: 101, name: 'Face Care' },
        { id: 102, name: 'Body Care'}
      ]
    },
    { 
      id: 2, 
      name: 'Haircare', 
      subcategories: [
        { id: 201, name: 'Shampoos',},
        { id: 202, name: 'Conditioners' }
      ]
    },
    { 
      id: 3, 
      name: 'Bodycare',
      subcategories: []
    }
  ]);
  
  const [testimonials, setTestimonials] = useState([
    { id: 1, name: 'Priya Sharma', content: 'These products transformed my skin!', rating: 5, status: 'approved' },
    { id: 2, name: 'Rahul Verma', content: 'Good quality but delivery was late', rating: 4, status: 'pending' }
  ]);
  
  const [blogs, setBlogs] = useState([
    { 
      id: 1, 
      title: 'Benefits of Natural Skincare', 
      category: 'Skincare', 
      subcategory: 'Face Care',
      date: '2024-01-15', 
      status: 'published', 
      comments: 8,
      content: 'This is the full content of the blog post about natural skincare benefits...',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    { 
      id: 2, 
      title: 'How to Take Care of Oily Hair', 
      category: 'Haircare', 
      subcategory: 'Shampoos',
      date: '2024-01-10', 
      status: 'draft', 
      comments: 0,
      content: 'This is the full content about haircare for oily hair...',
      videoUrl: ''
    }
  ]);
  
  const [comments, setComments] = useState([
    { id: 1, post: 'Benefits of Natural Skincare', author: 'Neha Patel', content: 'Great article! When will you write about dry skin?', date: '2024-01-16', status: 'approved' },
    { id: 2, post: 'Benefits of Natural Skincare', author: 'Amit Kumar', content: 'I tried these tips and they worked wonders!', date: '2024-01-17', status: 'pending' }
  ]);
  
  const [deliverySettings, setDeliverySettings] = useState({
    mode: "fixed",
    fixedCharge: 0,
    apiUrl: "",
    freeDeliveryAbove: 0,
  });

  const [banners, setBanners] = useState([
    { heading: "", subtext: "", buttonText: "", redirectUrl: "", imageFile: null, imagePreview: "" },
  ]);

  const [selectedImage, setSelectedImage] = useState(null);
  const previewUrlsRef = useRef([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      previewUrlsRef.current = [];
    };
  }, []);

  // Render the appropriate tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <CategoriesTab 
            categories={categories}
            setCategories={setCategories}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsTab 
            testimonials={testimonials}
            setTestimonials={setTestimonials}
          />
        );
      case 'blogs':
        return (
          <BlogsTab 
            blogs={blogs}
            setBlogs={setBlogs}
            categories={categories}
          />
        );
      case 'comments':
        return (
          <CommentsTab 
            comments={comments}
            setComments={setComments}
          />
        );
      case 'other':
        return (
          <OtherTab 
            deliverySettings={deliverySettings}
            setDeliverySettings={setDeliverySettings}
            banners={banners}
            setBanners={setBanners}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            previewUrlsRef={previewUrlsRef}
          />
        );
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
          { id: 'testimonials', name: 'Testimonials', icon: faComment },
          { id: 'blogs', name: 'Blogs', icon: faBookOpen },
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