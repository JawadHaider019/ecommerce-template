import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrash, faEnvelope, faEnvelopeOpen, faEye, faStar, faStarHalfAlt, faTimes, faChevronLeft, faChevronRight, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Updated sample data with multiple images
const sampleComments = [
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
    rating: 4.5,
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
  }
];

// Toast Component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? faCheck : faExclamationTriangle;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-slide-in`}>
      <FontAwesomeIcon icon={icon} className="text-lg" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 ml-2">
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

const CommentsTab = ({ comments: externalComments, setComments: externalSetComments }) => {
  // Use internal state if no external comments provided
  const [internalComments, setInternalComments] = useState(sampleComments);
  
  // Use external comments if provided, otherwise use internal state
  const comments = externalComments || internalComments;
  const setComments = externalSetComments || setInternalComments;

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'replied'

  // Modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Filter comments based on status
  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !comment.isRead;
    if (filter === 'replied') return comment.hasReply;
    return true;
  });

  const markAsRead = (id) => {
    setComments(comments.map(comment => 
      comment.id === id ? {...comment, isRead: true} : comment
    ));
    showToast('Comment marked as read', 'success');
  };

  const markAsUnread = (id) => {
    setComments(comments.map(comment => 
      comment.id === id ? {...comment, isRead: false} : comment
    ));
    showToast('Comment marked as unread', 'success');
  };

  // Open delete confirmation modal
  const openDeleteModal = (comment) => {
    setCommentToDelete(comment);
    setIsDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  // Delete comment after confirmation
  const confirmDelete = () => {
    if (commentToDelete) {
      setComments(comments.filter(comment => comment.id !== commentToDelete.id));
      showToast('Comment deleted successfully', 'success');
      closeDeleteModal();
    }
  };

  const replyToComment = (id) => {
    if (replyContent.trim() === '') return;
    
    // Add reply to the comment and mark as read
    const updatedComments = comments.map(comment => {
      if (comment.id === id) {
        return {
          ...comment,
          hasReply: true,
          isRead: true,
          reply: {
            content: replyContent,
            date: new Date().toISOString(),
            author: 'Admin'
          }
        };
      }
      return comment;
    });
    
    setComments(updatedComments);
    setReplyingTo(null);
    setReplyContent('');
    showToast('Reply sent successfully', 'success');
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Close toast
  const closeToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  // Function to render star ratings with support for decimals
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          className="text-yellow-400 text-sm"
        />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon
          key="half"
          icon={faStarHalfAlt}
          className="text-yellow-400 text-sm"
        />
      );
    }
    
    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className="text-gray-300 text-sm"
        />
      );
    }
    
    return stars;
  };

  // Open modal with images
  const openImageModal = (images, index = 0) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
    );
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (isImageModalOpen) {
        if (e.key === 'Escape') {
          closeImageModal();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        }
      }
      if (isDeleteModalOpen && e.key === 'Escape') {
        closeDeleteModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen, isDeleteModalOpen, currentImages.length]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
              filter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('all')}
          >
            All Comments
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
              filter === 'unread' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
              filter === 'replied' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter('replied')}
          >
            Replied
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {filteredComments.length} comments
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment & Reply
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-4xl" />
                    </div>
                    <p className="text-gray-500 text-lg">No comments found</p>
                  </td>
                </tr>
              ) : (
                filteredComments.map(comment => (
                  <React.Fragment key={comment.id}>
                    <tr className={!comment.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          {/* Multiple Product Images */}
                          <div className="flex flex-col space-y-1">
                            <div className="flex space-x-1">
                              {comment.productImages.slice(0, 2).map((image, index) => (
                                <img 
                                  key={index}
                                  src={image} 
                                  alt={`${comment.productName} ${index + 1}`}
                                  className="w-10 h-10 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => openImageModal(comment.productImages, index)}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40x40?text=Image';
                                  }}
                                />
                              ))}
                            </div>
                            {comment.productImages.length > 2 && (
                              <div className="flex space-x-1">
                                {comment.productImages.slice(2, 4).map((image, index) => (
                                  <img 
                                    key={index + 2}
                                    src={image} 
                                    alt={`${comment.productName} ${index + 3}`}
                                    className="w-10 h-10 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => openImageModal(comment.productImages, index + 2)}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/40x40?text=Image';
                                    }}
                                  />
                                ))}
                                {comment.productImages.length > 4 && (
                                  <div 
                                    className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 border cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => openImageModal(comment.productImages, 4)}
                                  >
                                    +{comment.productImages.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">
                              {comment.productName}
                            </div>
                            <div className="text-xs text-gray-500 capitalize mb-1">
                              {comment.type} • ${comment.productPrice}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                comment.isRead 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                <FontAwesomeIcon 
                                  icon={comment.isRead ? faEnvelopeOpen : faEnvelope} 
                                  className="mr-1 text-xs" 
                                />
                                {comment.isRead ? 'Read' : 'Unread'}
                              </span>
                              {comment.hasReply && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  <FontAwesomeIcon icon={faReply} className="mr-1 text-xs" />
                                  Replied
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{comment.author}</div>
                        <div className="text-sm text-gray-500">{comment.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {/* Customer Comment */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-500">Customer Comment:</div>
                              {/* Comment Rating */}
                              {comment.rating && (
                                <div className="flex items-center space-x-2 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                  <div className="flex items-center space-x-1">
                                    {renderStarRating(comment.rating)}
                                  </div>
                                  <span className="text-xs font-medium text-gray-700">
                                    {comment.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                              {comment.content}
                            </div>
                          </div>
                          
                          {/* Admin Reply */}
                          {comment.hasReply && comment.reply && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Your Reply:</div>
                              <div className="text-sm bg-green-50 border border-green-200 p-3 rounded-lg">
                                <div className="text-green-800">{comment.reply.content}</div>
                                <div className="text-xs text-green-600 mt-1 flex justify-between">
                                  <span>Replied on {new Date(comment.reply.date).toLocaleDateString()}</span>
                                  <span className="font-medium">By {comment.reply.author}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(comment.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(comment.date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {!comment.isRead ? (
                            <button 
                              className="flex items-center justify-center w-full px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              onClick={() => markAsRead(comment.id)}
                              title="Mark as Read"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              Mark Read
                            </button>
                          ) : (
                            <button 
                              className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => markAsUnread(comment.id)}
                              title="Mark as Unread"
                            >
                              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                              Mark Unread
                            </button>
                          )}
                          
                          {!comment.hasReply && (
                            <button 
                              className="flex items-center justify-center w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              title="Reply to Comment"
                            >
                              <FontAwesomeIcon icon={faReply} className="mr-2" />
                              Reply
                            </button>
                          )}
                          
                          <button 
                            className="flex items-center justify-center w-full px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            onClick={() => openDeleteModal(comment)}
                            title="Delete Comment"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Reply Editor */}
                    {replyingTo === comment.id && (
                      <tr className="bg-blue-25">
                        <td colSpan="5" className="px-6 py-4 border-t border-blue-200">
                          <div className="max-w-4xl mx-auto">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Reply to <span className="text-blue-600">{comment.author}</span>'s comment about 
                              <span className="text-blue-600"> {comment.productName}</span>:
                            </label>
                            <div className="flex flex-col space-y-3">
                              <textarea
                                placeholder="Type your professional reply here..."
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                              />
                              <div className="flex gap-3 justify-end">
                                <button
                                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyContent('');
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-blue-300"
                                  onClick={() => replyToComment(comment.id)}
                                  disabled={!replyContent.trim()}
                                >
                                  Send Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>

            {/* Navigation Buttons */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={currentImages[currentImageIndex]}
                alt={`Product image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
              />
            </div>

            {/* Image Counter */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
                {currentImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-12 h-12 object-cover rounded cursor-pointer border-2 ${
                      index === currentImageIndex ? 'border-white' : 'border-transparent'
                    } hover:border-gray-300 transition-all`}
                    onClick={() => setCurrentImageIndex(index)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48?text=Image';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && commentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Comment</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the comment from <strong>{commentToDelete.author}</strong> about <strong>{commentToDelete.productName}</strong>? This action cannot be undone.
            </p>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Delete Comment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
    </div>
  );
};

export default CommentsTab;