import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faPlus, faChevronLeft, faChevronRight, faEdit, faTimes, faGlobe, faEnvelope, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTiktok, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:4000/api';

const TestimonialsTab = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ 
    name: '', 
    content: '', 
    rating: 5, 
    platform: 'website' 
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', content: '', rating: 5, platform: 'website' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, testimonial: null });
  const [loading, setLoading] = useState(false);

  // Platform options with React Icons and colors
  const platformOptions = [
    { 
      value: 'website', 
      label: 'Website', 
      icon: <FontAwesomeIcon icon={faGlobe} />, 
      color: 'bg-gray-100 text-gray-800 border-gray-200' 
    },
    { 
      value: 'email', 
      label: 'Email', 
      icon: <FontAwesomeIcon icon={faEnvelope} />, 
      color: 'bg-gray-100 text-gray-800 border-gray-200' 
    },
    { 
      value: 'facebook', 
      label: 'Facebook', 
      icon: <FontAwesomeIcon icon={faFacebook} />, 
      color: 'bg-blue-100 text-blue-800 border-blue-200' 
    },
    { 
      value: 'instagram', 
      label: 'Instagram', 
      icon: <FontAwesomeIcon icon={faInstagram} />, 
      color: 'bg-pink-100 text-pink-800 border-pink-200' 
    },
    { 
      value: 'tiktok', 
      label: 'TikTok', 
      icon: <FontAwesomeIcon icon={faTiktok} />, 
      color: 'bg-black-100 text-gray-800 border-gray-200' 
    },
    { 
      value: 'whatsapp', 
      label: 'WhatsApp', 
      icon: <FontAwesomeIcon icon={faWhatsapp} />, 
      color: 'bg-green-100 text-green-800 border-green-200' 
    }
  ];

  // Fetch testimonials from backend
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/testimonials`);
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  // Add new testimonial to backend
  const addTestimonial = async () => {
    if (newTestimonial.name.trim() === '' || newTestimonial.content.trim() === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTestimonial),
      });

      if (!response.ok) throw new Error('Failed to add testimonial');

      const savedTestimonial = await response.json();
      setTestimonials(prev => [...prev, savedTestimonial]);
      setNewTestimonial({ name: '', content: '', rating: 5, platform: 'website' });
      toast.success('Testimonial added successfully!');
    } catch (error) {
      console.error('Error adding testimonial:', error);
      toast.error('Failed to add testimonial');
    } finally {
      setLoading(false);
    }
  };

  // Approve testimonial
  const approveTestimonial = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve testimonial');

      const updatedTestimonial = await response.json();
      setTestimonials(prev => 
        prev.map(test => test._id === id ? updatedTestimonial : test)
      );
      toast.success('Testimonial approved!');
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast.error('Failed to approve testimonial');
    }
  };

  // Update testimonial
  const updateTestimonial = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update testimonial');

      const updatedTestimonial = await response.json();
      setTestimonials(prev => 
        prev.map(test => test._id === id ? updatedTestimonial : test)
      );
      return updatedTestimonial;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  };

  // Delete testimonial
  const deleteTestimonial = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete testimonial');

      setTestimonials(prev => prev.filter(test => test._id !== id));
      toast.success('Testimonial deleted successfully!');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  // Load testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filter only approved testimonials for the slider
  const approvedTestimonials = testimonials.filter(test => test.status === 'approved');

  // Auto-advance slider
  useEffect(() => {
    if (approvedTestimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % approvedTestimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [approvedTestimonials.length]);

  const openDeleteModal = (testimonial) => {
    setDeleteModal({ isOpen: true, testimonial });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, testimonial: null });
  };

  const confirmDelete = async () => {
    if (deleteModal.testimonial) {
      await deleteTestimonial(deleteModal.testimonial._id);
      if (editingTestimonial === deleteModal.testimonial._id) {
        setEditingTestimonial(null);
      }
      closeDeleteModal();
    }
  };

  const startEditing = (testimonial) => {
    setEditingTestimonial(testimonial._id);
    setEditForm({
      name: testimonial.name,
      content: testimonial.content,
      rating: testimonial.rating,
      platform: testimonial.platform || 'website'
    });
  };

  const cancelEditing = () => {
    setEditingTestimonial(null);
    setEditForm({ name: '', content: '', rating: 5, platform: 'website' });
  };

  const saveEditing = async () => {
    if (editForm.name.trim() === '' || editForm.content.trim() === '') {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await updateTestimonial(editingTestimonial, editForm);
      setEditingTestimonial(null);
      setEditForm({ name: '', content: '', rating: 5, platform: 'website' });
      toast.success('Testimonial updated successfully!');
    } catch (error) {
      toast.error('Failed to update testimonial');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % approvedTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + approvedTestimonials.length) % approvedTestimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Get platform details
  const getPlatformDetails = (platformValue) => {
    return platformOptions.find(p => p.value === platformValue) || platformOptions[0];
  };

  // Star rating component
  const StarRating = ({ rating, size = 'lg' }) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg',
      xl: 'text-xl'
    };

    return (
      <div className="flex justify-center mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Add New Testimonial Form */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Testimonial</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
            <input
              type="text"
              placeholder="Enter customer name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              value={newTestimonial.name}
              onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              value={newTestimonial.rating}
              onChange={(e) => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform/Source</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              value={newTestimonial.platform}
              onChange={(e) => setNewTestimonial({...newTestimonial, platform: e.target.value})}
            >
              {platformOptions.map(platform => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial Content</label>
          <textarea
            placeholder="What did the customer say?"
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
            value={newTestimonial.content}
            onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
          />
        </div>
        <button
          className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={addTestimonial}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {loading ? 'Adding...' : 'Add Testimonial'}
        </button>
      </div>
      
      {/* Testimonials Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Manage Testimonials</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.map(testimonial => {
                const platform = getPlatformDetails(testimonial.platform);
                return (
                  <tr key={testimonial._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testimonial.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">{testimonial.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${platform.color} border`}>
                        <span className="mr-1.5 w-3 text-center">{platform.icon}</span>
                        {platform.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">{'★'.repeat(testimonial.rating)}</span>
                        <span className="text-gray-300">{'★'.repeat(5-testimonial.rating)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        testimonial.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {testimonial.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {testimonial.status !== 'approved' && (
                        <button 
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors duration-200"
                          onClick={() => approveTestimonial(testimonial._id)}
                          title="Approve"
                          disabled={loading}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                      <button 
                        className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
                        onClick={() => startEditing(testimonial)}
                        title="Edit"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200"
                        onClick={() => openDeleteModal(testimonial)}
                        title="Delete"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Section - At Bottom */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Website Preview</h3>
            <p className="text-sm text-gray-600 mt-1">This is how your testimonials will appear on your website</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {approvedTestimonials.length} approved testimonial{approvedTestimonials.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {approvedTestimonials.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            {/* Slider Container */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              {/* Testimonial Cards */}
              <div className="relative overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {approvedTestimonials.map((testimonial, index) => {
                    const platform = getPlatformDetails(testimonial.platform);
                    return (
                      <div 
                        key={testimonial._id}
                        className="w-full flex-shrink-0 px-4"
                      >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative group">
                          {/* Edit/Delete Buttons for Preview */}
                          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-md"
                              onClick={() => startEditing(testimonial)}
                              title="Edit"
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEdit} className="text-sm" />
                            </button>
                            <button 
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
                              onClick={() => openDeleteModal(testimonial)}
                              title="Delete"
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            </button>
                          </div>

                          {/* Platform Badge */}
                          <div className="absolute top-4 left-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${platform.color} border border-white shadow-sm`}>
                              <span className="mr-1.5 w-3 text-center">{platform.icon}</span>
                              {platform.label}
                            </span>
                          </div>

                          <StarRating rating={testimonial.rating} size="xl" />
                          
                          <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 text-center font-light mt-4">
                            "{testimonial.content}"
                          </blockquote>
                          
                          <div className="text-center">
                            <div className="text-gray-900 font-semibold text-lg mb-1">— {testimonial.name}</div>
                            <div className="w-12 h-1 bg-gradient-to-r from-black to-gray-600 rounded-full mx-auto"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Arrows */}
                {approvedTestimonials.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </>
                )}
              </div>

              {/* Dots Indicator */}
              {approvedTestimonials.length > 1 && (
                <div className="flex justify-center mt-8 space-x-3">
                  {approvedTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-black transform scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <FontAwesomeIcon icon={faPlus} className="text-4xl" />
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Approved Testimonials</h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Approve some testimonials from the table above to see how they'll look on your website.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Edit Testimonial</h3>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  value={editForm.rating}
                  onChange={(e) => setEditForm({...editForm, rating: parseInt(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform/Source</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  value={editForm.platform}
                  onChange={(e) => setEditForm({...editForm, platform: e.target.value})}
                >
                  {platformOptions.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  value={editForm.content}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelEditing}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700  hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={saveEditing}
                className="flex-1 px-4 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Testimonial</h3>
              <p className="text-gray-600">
                Are you sure you want to delete the testimonial from <strong>{deleteModal.testimonial?.name}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white  hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsTab;