import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProduct from '../components/RelatedProduct';
import RelatedDeals from '../components/RelatedDeals';
import { FaStar, FaStarHalf, FaRegStar, FaThumbsUp, FaThumbsDown, FaTimes, FaUserShield, FaShoppingCart, FaPlus, FaMinus, FaClock, FaFire } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState('reviews');
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
    
    if (input.includes('***')) return input;
    
    if (input.includes('@')) {
      const [localPart, domain] = input.split('@');
      const firstChar = localPart[0];
      return `${firstChar}***@${domain}`;
    }
    
    if (input.length <= 2) {
      return input + '***';
    }
    const visiblePart = input.substring(0, 2);
    return `${visiblePart}***`;
  };

  // Fetch deal data and reviews
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${backendUrl}/api/deal/single`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dealId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.deal) {
          setDealData(data.deal);
          if (data.deal.dealImages && data.deal.dealImages.length > 0) {
            setImage(data.deal.dealImages[0]);
          }
          
          fetchDealReviews(dealId);
        } else {
          throw new Error(data.message || 'Deal not found');
        }
      } catch (error) {
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
      const response = await fetch(`${backendUrl}/api/comments?dealId=${dealId}`);
      
      if (response.ok) {
        const comments = await response.json();
        
        const dealReviews = comments.map(comment => ({
          id: comment._id,
          rating: comment.rating,
          comment: comment.content,
          images: comment.reviewImages?.map(img => img.url) || [],
          date: new Date(comment.date).toLocaleDateString(),
          author: comment.email,
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
        
        setReviews(dealReviews);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleQuantityChange = (e) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    value = Math.min(value, 10);
    setQuantity(value);
  };

  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const imageData = files.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      setReviewImages((prevImages) => [...prevImages, ...imageData]);
    }
  };

  const removeReviewImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!user || !user._id) {
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

      reviewImages.forEach((imageData, index) => {
        formData.append('reviewImages', imageData.file);
      });

      const currentToken = token || localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/comments`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        const newComment = await response.json();
        
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
        fetchDealReviews(dealId);
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      toast.error('Error submitting review');
    } finally {
      setUploading(false);
    }
  };

  const getUserInteractionStatus = (review) => {
    if (!user || !user._id) return { hasLiked: false, hasDisliked: false };
    
    const hasLiked = review.likedBy?.includes(user._id) || false;
    const hasDisliked = review.dislikedBy?.includes(user._id) || false;
    
    return { hasLiked, hasDisliked };
  };

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
      
      if (hasLiked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/remove-like`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      } else if (hasDisliked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/like`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      } else {
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
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review.id === reviewId) {
              const updatedReview = { ...review };
              
              if (hasLiked) {
                updatedReview.likes = Math.max(0, (review.likes || 0) - 1);
                updatedReview.likedBy = (review.likedBy || []).filter(id => id !== user._id);
              } else if (hasDisliked) {
                updatedReview.likes = (review.likes || 0) + 1;
                updatedReview.dislikes = Math.max(0, (review.dislikes || 0) - 1);
                updatedReview.likedBy = [...(review.likedBy || []), user._id];
                updatedReview.dislikedBy = (review.dislikedBy || []).filter(id => id !== user._id);
              } else {
                updatedReview.likes = (review.likes || 0) + 1;
                updatedReview.likedBy = [...(review.likedBy || []), user._id];
              }
              
              return updatedReview;
            }
            return review;
          })
        );
      } else {
        toast.error('Failed to update like');
      }
    } catch (error) {
      toast.error('Error updating like');
    }
  };

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
      
      if (hasDisliked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/remove-dislike`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      } else if (hasLiked) {
        response = await fetch(`${backendUrl}/api/comments/${reviewId}/dislike`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user._id })
        });
      } else {
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
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review.id === reviewId) {
              const updatedReview = { ...review };
              
              if (hasDisliked) {
                updatedReview.dislikes = Math.max(0, (review.dislikes || 0) - 1);
                updatedReview.dislikedBy = (review.dislikedBy || []).filter(id => id !== user._id);
              } else if (hasLiked) {
                updatedReview.likes = Math.max(0, (review.likes || 0) - 1);
                updatedReview.dislikes = (review.dislikes || 0) + 1;
                updatedReview.dislikedBy = [...(review.dislikedBy || []), user._id];
                updatedReview.likedBy = (review.likedBy || []).filter(id => id !== user._id);
              } else {
                updatedReview.dislikes = (review.dislikes || 0) + 1;
                updatedReview.dislikedBy = [...(review.dislikedBy || []), user._id];
              }
              
              return updatedReview;
            }
            return review;
          })
        );
      } else {
        toast.error('Failed to update dislike');
      }
    } catch (error) {
      toast.error('Error updating dislike');
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const toggleShowAllReviews = () => {
    setShowAllReviews((prev) => !prev);
  };

  const filterReviewsByRating = (rating) => {
    if (filterRating === rating) {
      setFilterRating(null);
    } else {
      setFilterRating(rating);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  const filteredReviews = filterRating
    ? reviews.filter((review) => review.rating === filterRating)
    : reviews;

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 10);

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

  const handleAddToCart = () => {
    if (addDealToCart) {
      addDealToCart(dealId, quantity);
      toast.success('Deal added to cart!');
      setQuantity(1);
    } else {
      toast.error('Unable to add deal to cart');
    }
  };

  const renderClickableStars = (currentRating, setRatingFunc) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="cursor-pointer text-yellow-400 text-xl transition-transform hover:scale-110"
          onClick={() => setRatingFunc(i)}
        >
          {i <= currentRating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return stars;
  };

  const getDealTypeBadge = (dealType) => {
    let dealTypeSlug = '';
    let dealTypeName = '';
    
    if (!dealType) {
      return { label: 'DEAL', color: 'bg-gray-500 text-white' };
    }
    
    if (typeof dealType === 'string') {
      dealTypeSlug = dealType.toLowerCase();
      dealTypeName = dealType;
    } else if (typeof dealType === 'object' && dealType !== null) {
      if (dealType.slug) {
        dealTypeSlug = dealType.slug.toLowerCase();
        dealTypeName = dealType.name || dealType.slug;
      } else if (dealType.name) {
        dealTypeSlug = dealType.name.toLowerCase().replace(/\s+/g, '_');
        dealTypeName = dealType.name;
      } else if (dealType._id) {
        return { label: 'DEAL', color: 'bg-gray-500 text-white' };
      }
    }

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
    
    return badge;
  };

  useEffect(() => {
    return () => {
      reviewImages.forEach(img => {
        if (img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [reviewImages]);

  // Enhanced Countdown Timer Component
  const CompactCountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({});
    const [expired, setExpired] = useState(false);

    useEffect(() => {
      const calculateTimeLeft = () => {
        const difference = new Date(endDate) - new Date();
        
        if (difference <= 0) {
          setExpired(true);
          return {};
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setExpired(false);
        return { days, hours, minutes, seconds };
      };

      setTimeLeft(calculateTimeLeft());
      
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    if (expired) {
      return (
        <div className="mt-2 p-2">
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <FaClock className="text-red-500" />
            <span>Deal Expired</span>
          </div>
        </div>
      );
    }

    const showDays = timeLeft.days > 1; 
    const showSeconds = true; 

    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <FaFire className="text-red-500" size={16} />
          <span className="text-red-600 font-bold text-sm">Flash Sale Ends In:</span>
        </div>
        
        <FlipCountdown
          days={timeLeft.days}
          hours={timeLeft.hours}
          minutes={timeLeft.minutes}
          seconds={timeLeft.seconds}
          showDays={showDays}
          showSeconds={showSeconds}
        />

        <div className="mt-2 text-xs text-red-500 text-center">
          {showDays ? 'Hurry! Limited time offer' : 'Final hours! Don\'t miss out'}
        </div>
      </div>
    );
  };

  // Flip Countdown Components
  const FlipUnit = ({ value }) => (
    <div className="relative w-6 h-8 sm:w-8 sm:h-10 perspective-200">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-black text-white rounded-md flex items-center justify-center text-sm sm:text-base font-bold shadow-md"
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const FlipCountdown = ({ days, hours, minutes, seconds, showDays, showSeconds }) => {
    const format = (num) => num.toString().padStart(2, "0").split("");

    const d = format(days || 0);
    const h = format(hours || 0);
    const m = format(minutes || 0);
    const s = format(seconds || 0);

    return (
      <div className="flex items-center justify-center gap-1 text-black px-2 py-1">
        {showDays && (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <FlipUnit value={d[0]} />
                <FlipUnit value={d[1]} />
              </div>
              <span className="text-xs text-black">days</span>
            </div>
            <span className="font-bold text-base pb-4">:</span>
          </>
        )}

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <FlipUnit value={h[0]} />
            <FlipUnit value={h[1]} />
          </div>
          <span className="text-xs text-black">hours</span>
        </div>
        <span className="font-bold text-base pb-4">:</span>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <FlipUnit value={m[0]} />
            <FlipUnit value={m[1]} />
          </div>
          <span className="text-xs text-black">mins</span>
        </div>

        {showSeconds && (
          <>
            <span className="font-bold text-base pb-4">:</span>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <FlipUnit value={s[0]} />
                <FlipUnit value={s[1]} />
              </div>
              <span className="text-xs text-black">sec</span>
            </div>
          </>
        )}
      </div>
    );
  };

  const isFlashSale = () => {
    if (!dealData?.dealType) return false;
    
    const dealType = dealData.dealType;
    if (typeof dealType === 'string') {
      return dealType.toLowerCase().includes('flash');
    } else if (typeof dealType === 'object') {
      return dealType.slug?.includes('flash') || dealType.name?.toLowerCase().includes('flash');
    }
    return false;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Deal Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !dealData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  const dealType = getDealTypeBadge(dealData.dealType);
  const flashSale = isFlashSale();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-0 sm:px-2 lg:px-6 py-8">
        {/* Deal Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 rounded-3xl border border-black/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <div className={`inline-block text-center px-3 py-1 text-xs font-bold ${dealType.color}`}>
                    {dealType.label}
                  </div>
                  {/* {flashSale && dealData.dealEndDate && (
                    <CompactCountdownTimer endDate={new Date(dealData.dealEndDate)} />
                  )} */}
                </div>
                <img
                  src={image || dealData.dealImages?.[0] || 'https://via.placeholder.com/500?text=Deal+Image'}
                  alt={dealData.dealName}
                  className="w-full h-auto max-w-full object-cover rounded-xl 
                             sm:max-h-[400px] 
                             md:max-h-[500px] 
                             lg:max-h-[600px]"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500?text=Deal+Image';
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {dealData.dealImages?.map((item, index) => (
                  <img
                    key={index}
                    src={item}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                      image === item ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setImage(item)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=Image';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Deal Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dealData.dealName}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {renderRating(averageRating)}
                    <span className="ml-2 text-lg font-medium text-gray-700">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{reviews.length} reviews</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-gray-900">
                  {currency} {dealData.dealFinalPrice?.toFixed(2) || '0.00'}
                </span>
                {dealData.dealTotal && dealData.dealTotal > dealData.dealFinalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {currency} {dealData.dealTotal.toFixed(2)}
                  </span>
                )}
              </div>

              {dealData.dealTotal && dealData.dealTotal > dealData.dealFinalPrice && (
                <p className="text-green-600 font-medium text-lg">
                  You save: {currency} {(dealData.dealTotal - dealData.dealFinalPrice).toFixed(2)}
                </p>
              )}

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">{dealData.dealDescription}</p>

              {/* Deal Products List */}
              {dealData.dealProducts && dealData.dealProducts.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-3">Bundle Contents</h3>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                    {dealData.dealProducts.map((product, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Quantity: {product.quantity}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Unit</p>
                            <p className="font-medium text-gray-700">{currency} {product.price}</p>
                          </div>
                          <div className="w-px h-6 bg-gray-300"></div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="font-bold text-green-600">{currency} {product.price * product.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deal Period */}
              {dealData.dealEndDate && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <FaClock className="text-red-600" />
                    <span className="font-medium">Deal ends: {new Date(dealData.dealEndDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= 10}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  Add to Cart
                </button>
              </div>

        
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-medium">Customer Reviews</h2>
          <div className="mt-4 flex flex-col items-center gap-6 rounded-3xl border border-black/50 p-4 sm:p-6 lg:flex-row">
            {/* Left Side – Average Rating */}
            <div className="flex flex-1 flex-col items-center w-full lg:w-auto">
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">out of 5</span>
              </div>
              <div className="mt-2 flex gap-1 text-sm sm:text-base">{renderRating(averageRating)}</div>
              <p className="mt-2 text-sm text-gray-500">Based on {reviews.length} reviews</p>
            </div>

            {/* Right Side – Star Rating Distribution & Filters */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="mt-2 space-y-2">
                {ratingBreakdown.map(({ star, count }) => (
                  <div
                    key={star}
                    className={`flex cursor-pointer items-center gap-2 p-1 rounded ${
                      filterRating === star ? 'bg-yellow-50' : ''
                    }`}
                    onClick={() => filterReviewsByRating(star)}
                  >
                    <div className="flex gap-1 text-xs sm:text-sm">{renderRating(star)}</div>
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-yellow-400"
                        style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm rounded-3xl border border-black/50 overflow-hidden mt-8">
          {/* Tab Headers */}
          <div className="border-b border-black/50">
            <div className="flex">
              <button
                className={`flex-1 px-6 py-4 text-lg font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`flex-1 px-6 py-4 text-lg font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed">{dealData.dealDescription}</p>
                
                {/* Products Included */}
                {dealData.dealProducts && dealData.dealProducts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dealData.dealProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{currency} {product.price}</p>
                            <p className="text-sm text-gray-500">per unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Review Form */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Experience</h3>
                  {!user || !user._id ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Please login to leave a review</p>
                      <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex gap-2 text-2xl">
                          {renderClickableStars(rating, setRating)}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <textarea
                          className="w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                          rows="4"
                          placeholder="Share your thoughts about this deal..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Photos (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800 transition-colors"
                        />
                      </div>

                      {reviewImages.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {reviewImages.map((imageData, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageData.url}
                                alt={`Preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                onClick={() => removeReviewImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <FaTimes size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmitReview}
                        disabled={uploading || rating === 0 || !comment.trim()}
                      >
                        {uploading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </div>
                        ) : (
                          'Submit Review'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Customer Reviews {filterRating && `- ${filterRating} Star${filterRating > 1 ? 's' : ''}`}
                  </h3>

                  {loadingReviews ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <div className="text-6xl mb-4">💬</div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
                      <p className="text-gray-600">Be the first to share your experience with this deal!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {displayedReviews.map((review) => {
                        const { hasLiked, hasDisliked } = getUserInteractionStatus(review);
                        
                        return (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                  <span className="font-medium text-gray-600 text-sm">
                                    {review.author.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{maskEmail(review.author)}</span>
                                    <div className="flex gap-1 text-yellow-400">
                                      {renderRating(review.rating)}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500">{review.date}</p>
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                            {review.images.length > 0 && (
                              <div className="flex gap-3 mb-4">
                                {review.images.map((imageUrl, index) => (
                                  <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`Review image ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                                    onClick={() => handleImageClick(imageUrl)}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Admin Reply */}
                            {review.hasReply && review.reply && (
                              <div className="ml-12 mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <FaUserShield className="text-blue-600" />
                                  <span className="font-medium text-blue-900">{review.reply.author}</span>
                                  <span className="text-sm text-blue-600">• {review.reply.date}</span>
                                </div>
                                <p className="text-blue-800">{review.reply.content}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-6 mt-4">
                              <button
                                onClick={() => handleLikeReview(review.id)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                                  hasLiked
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <FaThumbsUp size={14} />
                                <span className="text-sm font-medium">{review.likes}</span>
                              </button>
                              <button
                                onClick={() => handleDislikeReview(review.id)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                                  hasDisliked
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <FaThumbsDown size={14} />
                                <span className="text-sm font-medium">{review.dislikes}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredReviews.length > 10 && (
                        <div className="text-center pt-6">
                          <button
                            onClick={toggleShowAllReviews}
                            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            {showAllReviews ? 'Show Less' : `Load More Reviews (${filteredReviews.length - 10}+)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products & Deals */}
        {dealData.category && (
          <div className="mt-12 space-y-12">
            <RelatedProduct category={dealData.category} />
            <RelatedDeals 
              category={dealData.category} 
              currentDealId={dealId} 
            />
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-2xl"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deal;