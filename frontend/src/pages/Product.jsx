import { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProduct from '../components/RelatedProduct';
import { FaStar, FaStarHalf, FaRegStar, FaThumbsUp, FaThumbsDown, FaTimes, FaUserShield, FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, user, token, backendUrl } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCartCalledRef = useRef(false);

  // Email masking function
  const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return 'Unknown User';
    
    if (email.includes('***@') || !email.includes('@')) return email;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return email;
    
    const [localPart, domain] = email.split('@');
    
    if (localPart.length === 1) {
      return `${localPart}***@${domain}`;
    }
    
    const firstChar = localPart[0];
    const maskedLocalPart = firstChar + '***';
    
    return `${maskedLocalPart}@${domain}`;
  };

  // Fetch product data and reviews
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (!productId) {
      setError('Product ID not found');
      setLoading(false);
      return;
    }

    if (!products || products.length === 0) {
      setLoading(false);
      return;
    }

    const product = products.find((item) => item._id === productId);

    if (product) {
      setProductData(product);
      setImage(product.image?.[0] || '');
      setError(null);
      fetchProductReviews(productId);
    } else {
      setError('Product not found');
    }
    setLoading(false);
  }, [productId, products]);

  const stock = productData ? productData.quantity : 0;

  // Monitor stock and adjust quantity if needed
  useEffect(() => {
    if (quantity > stock) {
      setQuantity(Math.max(1, stock));
    }
  }, [stock, quantity]);

  // Fetch reviews from backend for specific product
  const fetchProductReviews = async (productId) => {
    if (!productId || !backendUrl) {
      return;
    }

    setLoadingReviews(true);
    try {
      const response = await fetch(`${backendUrl}/api/comments?productId=${productId}`);
      
      if (response.ok) {
        const comments = await response.json();
        
        const productReviews = comments.map(comment => ({
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
        
        setReviews(productReviews);
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (error) {
      toast.error('Error loading reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const renderStockStatus = () => {
    if (stock === 0) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
          <span className="font-medium">Out of Stock</span>
        </div>
      );
    } else if (stock < 5) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <div>
            <span className="font-medium">Only {stock} left</span>
            <p className="text-sm text-red-500">Hurry, low stock</p>
          </div>
        </div>
      );
    } else if (stock < 10) {
      return (
        <div className="flex items-center gap-2 text-orange-600">
          <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
          <div>
            <span className="font-medium">{stock} items left</span>
            <p className="text-sm text-orange-500">Limited stock</p>
          </div>
        </div>
      );
    } else if (stock < 20) {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
          <span className="font-medium">Limited items left</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <div>
            <span className="font-medium">In Stock</span>
            <p className="text-sm text-green-500">Ready to ship</p>
          </div>
        </div>
      );
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

  const incrementQuantity = () => {
    if (quantity < stock) {
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
    if (reviewImages[index]?.url) {
      URL.revokeObjectURL(reviewImages[index].url);
    }
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!user || !user._id) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim() === '') {
      toast.error('Please write a review comment');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('targetType', 'product');
      formData.append('productId', productId);
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
          author: newComment.email,
          likes: newComment.likes || 0,
          dislikes: newComment.dislikes || 0,
          likedBy: newComment.likedBy?.map(user => user._id || user) || [],
          dislikedBy: newComment.dislikedBy?.map(user => user._id || user) || [],
          hasReply: newComment.hasReply || false,
          reply: newComment.reply ? {
            id: newComment.reply._id || 'reply-' + newComment._id,
            content: newComment.reply.content,
            author: newComment.reply.author || 'Admin',
            isAdmin: true,
            date: new Date(newComment.reply.date).toLocaleDateString()
          } : null
        };

        setReviews((prevReviews) => [newReview, ...prevReviews]);
        setRating(0);
        setComment('');
        reviewImages.forEach(image => URL.revokeObjectURL(image.url));
        setReviewImages([]);
        
        toast.success('Review submitted successfully!');
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

      let endpoint = '';
      let method = 'PATCH';

      if (hasLiked) {
        endpoint = 'remove-like';
      } else if (hasDisliked) {
        endpoint = 'like';
      } else {
        endpoint = 'like';
      }

      const response = await fetch(`${backendUrl}/api/comments/${reviewId}/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user._id })
      });

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

      let endpoint = '';
      let method = 'PATCH';

      if (hasDisliked) {
        endpoint = 'remove-dislike';
      } else if (hasLiked) {
        endpoint = 'dislike';
      } else {
        endpoint = 'dislike';
      }

      const response = await fetch(`${backendUrl}/api/comments/${reviewId}/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user._id })
      });

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

  const handleAddToCart = async () => {
    if (isAddingToCart || addToCartCalledRef.current) {
      return;
    }

    if (stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    const finalQuantity = Math.min(quantity, stock);
    
    if (finalQuantity !== quantity) {
      setQuantity(finalQuantity);
      toast.info(`Quantity adjusted to available stock: ${finalQuantity}`);
    }
    
    setIsAddingToCart(true);
    addToCartCalledRef.current = true;

    try {
      addToCart(productData._id, finalQuantity);
      toast.success('Product added to cart!');
      setQuantity(1);
    
    } catch (error) {
      toast.error('Failed to add product to cart');
    } finally {
      setTimeout(() => {
        setIsAddingToCart(false);
        addToCartCalledRef.current = false;
      }, 1000);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2">
        <div className="text-center max-w-lg ">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
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

  if (loading || !productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  const hasDiscount = productData.discountprice !== undefined && 
                     productData.discountprice !== null && 
                     productData.discountprice !== productData.price;
  
  const actualPrice = hasDiscount ? productData.discountprice : productData.price;
  const originalPrice = hasDiscount ? productData.price : null;
  
  const discountPercentage = hasDiscount 
    ? Math.round(((productData.price - productData.discountprice) / productData.price) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-0   sm:px-2 lg:px-6 py-8 ">
        {/* Product Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 rounded-3xl  border border-black/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                {discountPercentage && (
                  <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {discountPercentage}% OFF
                  </div>
                )}
          <img
  src={image || productData.image?.[0]}
  alt={productData.name}
  className="w-full h-auto max-w-full object-cover rounded-xl 
             sm:max-h-[400px] 
             md:max-h-[500px] 
             lg:max-h-[600px] "
  onError={(e) => {
    e.target.src = 'https://via.placeholder.com/500?text=Product+Image';
  }}
/>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productData.image?.map((item, index) => (
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

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{productData.name}</h1>
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
                  {currency} {actualPrice.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {currency} {originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">{productData.description}</p>

              {/* Stock Status */}
              <div className="p-4 bg-gray-50 rounded-xl">
                {renderStockStatus()}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1 || stock === 0}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= stock || stock === 0}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={stock === 0 || isAddingToCart}
                  className={`w-full py-4  px-6 rounded-xl font-semibold text-lg transition-all ${
                    stock === 0 || isAddingToCart
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding to Cart...
                    </div>
                  ) : stock === 0 ? (
                    'Out of Stock'
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaShoppingCart />
                      Add to Cart 
                    </div>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Customer Reviews Section - KEPT EXACTLY THE SAME */}
        <div className="mt-20 ">
          <h2 className="text-2xl  font-medium">Customer Reviews</h2>
          <div className="mt-4 flex flex-col items-center gap-6 rounded-3xl  border border-black/50 p-4 sm:p-6 lg:flex-row">
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
        <div className="bg-white rounded-2xl shadow-sm rounded-3xl  border border-black/50 overflow-hidden mt-8">
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
                <p className="text-gray-600 text-lg leading-relaxed">{productData.description}</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Key Features</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        Made with pure, natural ingredients
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        Free from harsh chemicals
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        Handcrafted with care
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Benefits</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        Gentle on skin
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        Environmentally friendly
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        Long-lasting results
                      </li>
                    </ul>
                  </div>
                </div>
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
                          placeholder="Share your thoughts about this product..."
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
                      <p className="text-gray-600">Be the first to share your experience with this product!</p>
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

        {/* Related Products */}
        {productData.category && (
          <div className="mt-12">
            <RelatedProduct category={productData.category} />
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

export default Product;