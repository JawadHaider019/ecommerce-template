import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProduct from '../components/RelatedProduct';
import RelatedDeals from '../components/RelatedDeals';
import { FaStar, FaStarHalf, FaRegStar, FaThumbsUp, FaThumbsDown, FaTimes, FaUserShield } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Deal = () => {
  const { dealId } = useParams();
  const { 
    backendUrl, 
    currency, 
    addDealToCart,
    user, 
    token
  } = useContext(ShopContext);
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filterRating, setFilterRating] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Email masking function
  const maskEmail = (input) => {
    if (!input || typeof input !== 'string') return 'Unknown User';
    
    // If it's already masked, return as is
    if (input.includes('***')) return input;
    
    // If it contains @, treat as email
    if (input.includes('@')) {
      const [localPart, domain] = input.split('@');
      const firstChar = localPart[0];
      return `${firstChar}***@${domain}`;
    }
    
    // Otherwise treat as username
    if (input.length <= 2) {
      return input + '***';
    }
    const visiblePart = input.substring(0, 2);
    return `${visiblePart}***`;
  };

  // Debug user authentication state
  useEffect(() => {
    console.log('🔐 Authentication Debug:');
    console.log('User object:', user);
    console.log('Token exists:', !!token);
    console.log('LocalStorage token:', localStorage.getItem('token'));
    console.log('User is logged in:', !!(user && user._id));
  }, [user, token]);

  // Fetch deal data and reviews
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching deal with ID:', dealId);
        console.log('🔗 Backend URL:', backendUrl);

        const response = await fetch(`${backendUrl}/api/deal/single`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dealId }),
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Deal API response:', data);

        if (data.success && data.deal) {
          setDealData(data.deal);
          if (data.deal.dealImages && data.deal.dealImages.length > 0) {
            setImage(data.deal.dealImages[0]);
          }
          console.log('🎯 Deal data set:', data.deal);
          console.log('🔍 Deal type:', data.deal.dealType);
          console.log('🔍 Deal type structure:', typeof data.deal.dealType, data.deal.dealType);
          
          // Fetch deal reviews
          fetchDealReviews(dealId);
        } else {
          throw new Error(data.message || 'Deal not found');
        }
      } catch (error) {
        console.error('❌ Error fetching deal:', error);
        setError(error.message || 'Failed to load deal');
      } finally {
        setLoading(false);
      }
    };

    if (dealId) {
      fetchDeal();
    } else {
      setError('No deal ID provided');
      setLoading(false);
    }
  }, [dealId, backendUrl]);

  // Fetch reviews from backend for specific deal
  const fetchDealReviews = async (dealId) => {
    setLoadingReviews(true);
    try {
      console.log('Fetching reviews for deal ID:', dealId);
      const response = await fetch(`${backendUrl}/api/comments?dealId=${dealId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const comments = await response.json();
        console.log('Raw comments from API:', comments);
        
        // Transform backend comments to frontend review format with replies
        const dealReviews = comments.map(comment => ({
          id: comment._id,
          rating: comment.rating,
          comment: comment.content,
          images: comment.reviewImages?.map(img => img.url) || [],
          date: new Date(comment.date).toLocaleDateString(),
          author:comment.email,
          likes: comment.likes || 0,
          dislikes: comment.dislikes || 0,
          likedBy: comment.likedBy?.map(user => user._id || user) || [],
          dislikedBy: comment.dislikedBy?.map(user => user._id || user) || [],
          hasReply: comment.hasReply || false,
          reply: comment.reply ? {
            id: comment.reply._id || 'reply-' + comment._id,
            content: comment.reply.content,
            author: comment.reply.author || 'Admin',
            isAdmin: true,
            date: new Date(comment.reply.date).toLocaleDateString()
          } : null
        }));
        
        console.log('Transformed reviews with replies:', dealReviews);
        setReviews(dealReviews);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch reviews:', errorText);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Calculate total stock for the deal
  const calculateTotalStock = () => {
    if (!dealData?.dealProducts) return 0;
    return dealData.dealProducts.reduce((total, product) => total + (product.quantity || 0), 0);
  };

  const stock = calculateTotalStock();

  // Render stock status
  const renderStockStatus = () => {
    if (stock === 0) {
      return <p className="p-4 text-red-500">Out of Stock</p>;
    } else if (stock < 10) {
      return <p className="p-4 text-red-500">{stock} items left</p>;
    } else if (stock < 20) {
      return <p className="p-4 text-orange-500">Limited items left</p>;
    } else {
      return <p className="p-4 text-green-500">In Stock</p>;
    }
  };

  const handleQuantityChange = (e) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    value = Math.min(value, stock);
    setQuantity(value);
  };

  // Handle multiple image uploads - store files for backend upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Store both file objects and URLs for preview
      const imageData = files.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      setReviewImages((prevImages) => [...prevImages, ...imageData]);
    }
  };

  // Remove review image
  const removeReviewImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle review submission to backend
  const handleSubmitReview = async () => {
    console.log('📝 Submit review clicked - Debug Info:');
    console.log('User:', user);
    console.log('User ID:', user?._id);
    console.log('Token:', token);
    console.log('Rating:', rating);
    console.log('Comment:', comment);

    if (!user || !user._id) {
      console.log('❌ No valid user found');
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0 || comment.trim() === '') {
      toast.error('Please provide a rating and comment');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('targetType', 'deal');
      formData.append('dealId', dealId);
      formData.append('userId', user._id);
      formData.append('content', comment);
      formData.append('rating', rating);

      // Append images if any
      reviewImages.forEach((imageData, index) => {
        formData.append('reviewImages', imageData.file);
      });

      console.log('📤 Submitting review with data:', {
        dealId,
        userId: user._id,
        rating,
        comment
      });

      const currentToken = token || localStorage.getItem('token');
      console.log('Using token:', currentToken);

      const response = await fetch(`${backendUrl}/api/comments`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      console.log('📨 Response status:', response.status);

      if (response.ok) {
        const newComment = await response.json();
        console.log('✅ Review submitted successfully:', newComment);
        
        // Transform backend response to frontend format
        const newReview = {
          id: newComment._id,
          rating: newComment.rating,
          comment: newComment.content,
          images: newComment.reviewImages?.map(img => img.url) || [],
          date: new Date(newComment.date).toLocaleDateString(),
         author: comment.email,
          likes: newComment.likes || 0,
          dislikes: newComment.dislikes || 0,
          likedBy: newComment.likedBy?.map(user => user._id || user) || [],
          dislikedBy: newComment.dislikedBy?.map(user => user._id || user) || [],
          hasReply: newComment.hasReply || false,
          reply: newComment.reply ? {
            id: newComment.reply._id || 'reply-' + newComment._id,
            content: newComment.reply.content,
                       author: comment.reply.author || 'Admin',
            isAdmin: true,
            date: new Date(newComment.reply.date).toLocaleDateString()
          } : null
        };

        setReviews((prevReviews) => [newReview, ...prevReviews]);
        setRating(0);
        setComment('');
        setReviewImages([]);
        
        toast.success('Review submitted successfully!');
        
        // Refresh reviews to ensure we have the latest data
        fetchDealReviews(dealId);
      } else {
        const error = await response.json();
        console.error('❌ Failed to submit review:', error);
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setUploading(false);
    }
  };

  // Check if current user has liked/disliked a review
  const getUserInteractionStatus = (review) => {
    if (!user || !user._id) return { hasLiked: false, hasDisliked: false };
    
    const hasLiked = review.likedBy?.includes(user._id) || false;
    const hasDisliked = review.dislikedBy?.includes(user._id) || false;
    
    return { hasLiked, hasDisliked };
  };

  // YouTube-like like functionality
  const handleLikeReview = async (reviewId) => {
    if (!user || !user._id) {
      toast.error('Please login to like reviews');
      return;
    }

    try {
      const currentToken = token || localStorage.getItem('token');
      const review = reviews.find(r => r.id === reviewId);
      const { hasLiked, hasDisliked } = getUserInteractionStatus(review);

      let response;
      
      // If already liked, remove the like (toggle off)
      if (hasLiked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/remove-like`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      } 
      // If disliked, switch to like (remove dislike and add like)
      else if (hasDisliked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/like`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      }
      // If neither, add like
      else {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/like`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      }

      if (response.ok) {
        const result = await response.json();
        
        // Update the review with new counts and user arrays
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review.id === reviewId) {
              const updatedReview = { ...review };
              
              if (hasLiked) {
                // Removing like
                updatedReview.likes = Math.max(0, (review.likes || 0) - 1);
                updatedReview.likedBy = (review.likedBy || []).filter(id => id !== user._id);
              } else if (hasDisliked) {
                // Switching from dislike to like
                updatedReview.likes = (review.likes || 0) + 1;
                updatedReview.dislikes = Math.max(0, (review.dislikes || 0) - 1);
                updatedReview.likedBy = [...(review.likedBy || []), user._id];
                updatedReview.dislikedBy = (review.dislikedBy || []).filter(id => id !== user._id);
              } else {
                // Adding like
                updatedReview.likes = (review.likes || 0) + 1;
                updatedReview.likedBy = [...(review.likedBy || []), user._id];
              }
              
              return updatedReview;
            }
            return review;
          })
        );
      } else {
        const error = await response.json();
        console.error('Failed to update like:', error);
        toast.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Error updating like');
    }
  };

  // YouTube-like dislike functionality
  const handleDislikeReview = async (reviewId) => {
    if (!user || !user._id) {
      toast.error('Please login to dislike reviews');
      return;
    }

    try {
      const currentToken = token || localStorage.getItem('token');
      const review = reviews.find(r => r.id === reviewId);
      const { hasLiked, hasDisliked } = getUserInteractionStatus(review);

      let response;
      
      // If already disliked, remove the dislike (toggle off)
      if (hasDisliked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/remove-dislike`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      } 
      // If liked, switch to dislike (remove like and add dislike)
      else if (hasLiked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/dislike`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      }
      // If neither, add dislike
      else {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/dislike`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      }

      if (response.ok) {
        const result = await response.json();
        
        // Update the review with new counts and user arrays
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review.id === reviewId) {
              const updatedReview = { ...review };
              
              if (hasDisliked) {
                // Removing dislike
                updatedReview.dislikes = Math.max(0, (review.dislikes || 0) - 1);
                updatedReview.dislikedBy = (review.dislikedBy || []).filter(id => id !== user._id);
              } else if (hasLiked) {
                // Switching from like to dislike
                updatedReview.likes = Math.max(0, (review.likes || 0) - 1);
                updatedReview.dislikes = (review.dislikes || 0) + 1;
                updatedReview.dislikedBy = [...(review.dislikedBy || []), user._id];
                updatedReview.likedBy = (review.likedBy || []).filter(id => id !== user._id);
              } else {
                // Adding dislike
                updatedReview.dislikes = (review.dislikes || 0) + 1;
                updatedReview.dislikedBy = [...(review.dislikedBy || []), user._id];
              }
              
              return updatedReview;
            }
            return review;
          })
        );
      } else {
        const error = await response.json();
        console.error('Failed to update dislike:', error);
        toast.error('Failed to update dislike');
      }
    } catch (error) {
      console.error('Error updating dislike:', error);
      toast.error('Error updating dislike');
    }
  };

  // Handle image click to show in modal
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Toggle to show all reviews or only 10 reviews
  const toggleShowAllReviews = () => {
    setShowAllReviews((prev) => !prev);
  };

  // Filter reviews by rating
  const filterReviewsByRating = (rating) => {
    if (filterRating === rating) {
      setFilterRating(null);
    } else {
      setFilterRating(rating);
    }
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // Get rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  // Get the reviews to display (filtered by rating or all)
  const filteredReviews = filterRating
    ? reviews.filter((review) => review.rating === filterRating)
    : reviews;

  // Get the reviews to display (10 initially or all)
  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 10);

  // Render rating stars
  const renderRating = (ratingValue = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaStar />
          </span>
        );
      } else if (i - 0.5 <= ratingValue) {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaStarHalf />
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaRegStar />
          </span>
        );
      }
    }
    return stars;
  };

  // UPDATED: Use addDealToCart function
  const handleAddToCart = () => {
    if (stock === 0) {
      toast.error('This deal is out of stock');
      return;
    }
    
    console.log('🛒 Adding deal to cart:', dealId);
    
    // Use the specific deal function
    if (addDealToCart) {
      addDealToCart(dealId, quantity);
      toast.success(`Added ${dealData.dealName} to cart!`);
      setQuantity(1);
    } else {
      console.error('addDealToCart function not available in ShopContext');
      toast.error('Unable to add deal to cart');
    }
  };

  const renderClickableStars = (currentRating, setRatingFunc) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="cursor-pointer text-yellow-400 text-xl"
          onClick={() => setRatingFunc(i)}
        >
          {i <= currentRating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return stars;
  };

// FIXED: Improved deal type badge function to handle different data structures
const getDealTypeBadge = (dealType) => {
  console.log('🔍 Processing deal type:', dealType);
  console.log('🔍 Type of dealType:', typeof dealType);
  
  // Handle different data structures from backend
  let dealTypeSlug = '';
  let dealTypeName = '';
  
  if (!dealType) {
    console.log('🔍 No deal type provided');
    return { label: 'DEAL', color: 'bg-gray-500 text-white' };
  }
  
  if (typeof dealType === 'string') {
    dealTypeSlug = dealType.toLowerCase();
    dealTypeName = dealType;
  } else if (typeof dealType === 'object' && dealType !== null) {
    // Handle populated object structure from backend
    if (dealType.slug) {
      dealTypeSlug = dealType.slug.toLowerCase();
      dealTypeName = dealType.name || dealType.slug;
    } else if (dealType.name) {
      dealTypeSlug = dealType.name.toLowerCase().replace(/\s+/g, '_');
      dealTypeName = dealType.name;
    } else if (dealType._id) {
      // If it's just an ObjectId reference without population
      console.log('🔍 Deal type is ObjectId reference, needs population');
      return { label: 'DEAL', color: 'bg-gray-500 text-white' };
    }
  }
  
  console.log('🔍 Extracted deal type slug:', dealTypeSlug);
  console.log('🔍 Extracted deal type name:', dealTypeName);

  const typeMap = {
    'flash_sale': { label: 'FLASH SALE', color: 'bg-red-500 text-white' },
    'flash': { label: 'FLASH SALE', color: 'bg-red-500 text-white' },
    'seasonal': { label: 'SEASONAL', color: 'bg-green-500 text-white' },
    'clearance': { label: 'CLEARANCE', color: 'bg-orange-500 text-white' },
    'bundle': { label: 'BUNDLE', color: 'bg-purple-500 text-white' },
    'featured': { label: 'FEATURED', color: 'bg-blue-500 text-white' },
    'buyonegetone': { label: 'BOGO', color: 'bg-pink-500 text-white' },
    'bogo': { label: 'BOGO', color: 'bg-pink-500 text-white' },
    'daily_deal': { label: 'DAILY DEAL', color: 'bg-indigo-500 text-white' },
    'daily': { label: 'DAILY DEAL', color: 'bg-indigo-500 text-white' },
    'weekly_special': { label: 'WEEKLY SPECIAL', color: 'bg-teal-500 text-white' },
    'weekly': { label: 'WEEKLY SPECIAL', color: 'bg-teal-500 text-white' },
    'special': { label: 'SPECIAL OFFER', color: 'bg-teal-500 text-white' }
  };
  
  const badge = typeMap[dealTypeSlug] || { 
    label: dealTypeName ? dealTypeName.toUpperCase() : 'DEAL', 
    color: 'bg-gray-500 text-white' 
  };
  
  console.log('🔍 Final badge:', badge);
  return badge;
};
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      reviewImages.forEach(img => {
        if (img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [reviewImages]);

  // Compact Countdown Timer
  const CompactCountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
      const calculateTimeLeft = () => {
        const difference = endDate - new Date();
        
        if (difference <= 0) {
          return {};
        }
        
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      };

      setTimeLeft(calculateTimeLeft());
      
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    if (Object.keys(timeLeft).length === 0) {
      return (
        <div className="mt-1 text-xs text-red-500">
          Expired
        </div>
      );
    }

    return (
      <div className="absolute top-8 right-2 mt-1 flex items-center gap-1 text-lg text-red-500">
        <span>Ends in:</span>
        <span className="text-xl">
          {timeLeft.hours?.toString().padStart(2, '0')}:
          {timeLeft.minutes?.toString().padStart(2, '0')}:
          {timeLeft.seconds?.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="border-t-2 pt-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading deal...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t-2 pt-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!dealData) {
    return (
      <div className="border-t-2 pt-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Deal not found</div>
        </div>
      </div>
    );
  }

  const dealType = getDealTypeBadge(dealData.dealType);
  console.log('🎯 Final deal type badge:', dealType);

  return (
    <div className="border-t-2 pt-10">
      <div className="flex flex-col gap-12 sm:flex-row sm:gap-12">
        <div className="flex flex-1 flex-col-reverse gap-3 sm:flex-row">
          {/* Thumbnail Images */}
          <div className="flex w-full justify-between overflow-x-auto sm:w-[18%] sm:flex-col sm:justify-normal sm:overflow-y-auto">
            {dealData.dealImages && dealData.dealImages.map((item, index) => (
              <img
                key={index}
                src={item}
                alt={`Deal Thumbnail ${index + 1}`}
                className="w-[24%] shrink-0 cursor-pointer sm:mb-3 sm:w-full"
                onClick={() => setImage(item)} 
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="relative w-full sm:w-4/5">
            <img
              src={image || '/images/fallback-image.jpg'}
              alt="Main Deal"
              className="h-auto w-full"
              onError={(e) => {
                e.target.src = '/images/fallback-image.jpg';
              }}
            />
          </div>
        </div>

        <div className="flex-1 relative">
          <h1 className="mt-2 text-2xl font-medium">{dealData.dealName}</h1>
          
          {/* Deal Type Badge */}
          <div className={`inline-block text-center  px-3 py-1 text-xs font-bold ${dealType.color} mb-2`}>
            {dealType.label}
          </div>
          
          {/* Countdown Timer for Flash Sales */}
          {dealData.dealType && (dealData.dealType.slug === 'flash_sale' || dealData.dealType === 'flash_sale') && dealData.dealEndDate && (
            <CompactCountdownTimer endDate={new Date(dealData.dealEndDate)} />
          )}
          
          <div className="mt-2 flex items-center gap-1">
            {renderRating(averageRating)} 
            <p className="pl-2">{averageRating.toFixed(1)}</p>
            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <p className="text-3xl font-medium">
              {currency} {dealData.dealFinalPrice?.toFixed(2) || '0.00'}
            </p>
            
            {dealData.dealTotal && dealData.dealTotal > dealData.dealFinalPrice && (
              <p className="text-sm text-gray-500 line-through">
                {currency} {dealData.dealTotal.toFixed(2)}
              </p>
            )}
          </div>

          {dealData.dealTotal && dealData.dealTotal > dealData.dealFinalPrice && (
            <p className="mt-2 text-green-600 font-medium">
              You save: {currency} {(dealData.dealTotal - dealData.dealFinalPrice).toFixed(2)}
            </p>
          )}

          <p className="mt-5 text-gray-500 md:w-4/5">{dealData.dealDescription}</p>
          
          {/* Deal Products List */}
          {dealData.dealProducts && dealData.dealProducts.length > 0 && (
            <div className="mt-4">
              <p className="font-medium">Includes {dealData.dealProducts.length} products:</p>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {dealData.dealProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-1 text-sm">
                    <span className="flex-1 truncate">{product.name} X {product.quantity}</span>
                    <span className="ml-2 text-gray-600">Subtotal: Rs. {product.price}</span>
                    <span className="ml-2 text-gray-600">Total: Rs. {product.price*product.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Deal Period */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Deal is valid till: </strong>
              <span className='text-red-500'>{dealData.dealEndDate && `  ${new Date(dealData.dealEndDate).toLocaleDateString()}`}</span>
            </p>
          </div>

          <div className="my-8 flex items-center gap-4">
            <p>Quantity</p>
            <div className="flex items-center gap-2">
              <input
                className="w-16 rounded border-2 border-gray-300 px-2 py-1 text-center text-sm"
                type="number"
                value={quantity}
                min={1}
                max={stock} 
                onChange={handleQuantityChange}
              />
            </div>
          </div>
          
          {renderStockStatus()}
          
          <button
            onClick={handleAddToCart}
            className={`btn ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={stock === 0}
          >
            {stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
          
          <hr className="mt-8 sm:w-4/5" />
          <div className="mt-5 flex flex-col gap-1 text-sm text-gray-500">
            <p>100% Original products.</p>
            <p>Cash on delivery is available on this deal.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Customer Reviews Section */}
      <div className="mt-20">
        <h2 className="text-2xl font-medium">Customer Reviews</h2>
        <div className="mt-4 flex flex-col items-center gap-6 rounded-lg border p-6 sm:flex-row">
          {/* Left Side – Average Rating */}
          <div className="flex flex-1 flex-col items-center">
            <div className="mt-2 flex items-center gap-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">out of 5</span>
            </div>
            <div className="mt-2 flex gap-1">{renderRating(averageRating)}</div>
            <p className="mt-2 text-sm text-gray-500">Based on {reviews.length} reviews</p>
          </div>

          {/* Right Side – Star Rating Distribution & Filters */}
          <div className="flex-1">
            <div className="mt-2 space-y-2">
              {ratingBreakdown.map(({ star, count }) => (
                <div
                  key={star}
                  className={`flex cursor-pointer items-center gap-2 p-1 rounded ${
                    filterRating === star ? 'bg-yellow-50' : ''
                  }`}
                  onClick={() => filterReviewsByRating(star)}
                >
                  <div className="flex gap-1">{renderRating(star)}</div>
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-yellow-400"
                      style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Description and Reviews */}
      <div className="mt-20">
        <div className="flex">
          <button
            className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Description Tab Content */}
        {activeTab === 'description' && (
          <div className="flex flex-col gap-4 border p-6 text-sm text-gray-500">
            <p>{dealData.dealDescription}</p>
            {dealData.dealProducts && dealData.dealProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Products Included:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {dealData.dealProducts.map((product, index) => (
                    <li key={index}>
                      <strong>{product.name} </strong> 
                       x {product.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="border p-6">
            {/* Review Form */}
            <div className="mb-8">
              <h3 className="text-lg font-medium">Leave a Review</h3>
              {!user || !user._id ? (
                <div>
                  <p className="mt-4 text-sm text-gray-500">Please login to leave a review.</p>
                </div>
              ) : (
                <>
                  <div className="mt-4">
                    <p className="mb-2">Your Rating:</p>
                    <div className="flex gap-1">
                      {renderClickableStars(rating, setRating)}
                    </div>
                  </div>
                  <textarea
                    className="mt-4 w-full rounded border-2 border-gray-300 p-2 text-sm"
                    rows="4"
                    placeholder="Write your review..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="text-sm"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {reviewImages.map((imageData, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageData.url}
                          alt={`Review Image ${index + 1}`}
                          className="size-20 rounded object-cover"
                        />
                        <button
                          onClick={() => removeReviewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-5 text-xs flex items-center justify-center"
                        >
                          <FaTimes size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`btn mt-4 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSubmitReview}
                    disabled={uploading}
                  >
                    {uploading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </>
              )}
            </div>

            {/* Display Existing Reviews */}
            <div className="mt-8">
              <h3 className="text-lg font-medium">Customer Reviews</h3>
              {loadingReviews ? (
                <p className="mt-4 text-sm text-gray-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">No reviews yet. Be the first to review!</p>
              ) : (
                <>
                  {displayedReviews.map((review) => {
                    const { hasLiked, hasDisliked } = getUserInteractionStatus(review);
                    
                    return (
                      <div key={review.id} className="mt-4 border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {renderRating(review.rating)}
                            {/* Author is already masked from the transformation */}
                            <span className="font-medium text-sm">{maskEmail(review.author)}</span>
                          </div>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                        <p className="mt-2 text-sm">{review.comment}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {review.images.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Review Image ${index + 1}`}
                              className="size-20 cursor-pointer object-cover"
                              onClick={() => handleImageClick(imageUrl)}
                            />
                          ))}
                        </div>

                        {/* Admin Reply Section */}
                        {review.hasReply && review.reply && (
                          <div className="mt-4 ml-4 border-l-2 border-black pl-4">
                            <div className="mb-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center gap-2 mb-1">
                                <FaUserShield className="text-black" size={14} />
                                {/* Reply author is already masked from the transformation */}
                                <span className="font-medium text-sm text-black">{review.reply.author}</span>
                                <span className="text-xs text-gray-500">{review.reply.date}</span>
                              </div>
                              <p className="text-sm text-gray-700">{review.reply.content}</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                          <span>Was this helpful?</span>
                          <button 
                            onClick={() => handleLikeReview(review.id)}
                            className={`flex items-center gap-1 transition-colors ${
                              hasLiked 
                                ? 'text-green-600 font-semibold' 
                                : 'hover:text-green-600'
                            }`}
                          >
                            <FaThumbsUp size={14} /> {review.likes}
                          </button>
                          <button 
                            onClick={() => handleDislikeReview(review.id)}
                            className={`flex items-center gap-1 transition-colors ${
                              hasDisliked 
                                ? 'text-red-600 font-semibold' 
                                : 'hover:text-red-600'
                            }`}
                          >
                            <FaThumbsDown size={14} /> {review.dislikes}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredReviews.length > 10 && (
                    <button
                      className="btn mt-4"
                      onClick={toggleShowAllReviews}
                    >
                      {showAllReviews ? 'Show Less' : `Show All (${filteredReviews.length})`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Enlarged Image */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Enlarged Review"
              className="max-h-[90vh] max-w-[90vw] rounded"
            />
            <button
              className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-black hover:bg-gray-200 transition-colors flex items-center justify-center"
              onClick={closeModal}
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Show Related Products if category exists */}
      {dealData.category && <RelatedProduct category={dealData.category} />}
      
      {/* Show Related Deals at the end */}
      <RelatedDeals 
        category={dealData.category} 
        currentDealId={dealId} 
      />
    </div>
  );
};

export default Deal;