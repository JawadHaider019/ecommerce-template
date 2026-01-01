import { useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProduct from '../components/RelatedProduct';
import LoginModal from '../components/Login';
import { 
  FaStar, 
  FaStarHalf, 
  FaRegStar, 
  FaThumbsUp, 
  FaThumbsDown, 
  FaTimes, 
  FaUserShield, 
  FaShoppingCart, 
  FaPlus, 
  FaMinus,
  FaFlask,
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner,
  FaWhatsapp,
  FaCalendarAlt,
  FaBox,
  FaTruck,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaTag
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { 
    products, 
    currency, 
    addToCart, 
    user, 
    token, 
    backendUrl,   
    getCartAmount, 
    isFreeDeliveryAvailable,
    getAmountForFreeDelivery 
  } = useContext(ShopContext);
  
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);
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
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  
  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    ingredients: false,
    benefits: false,
    howToUse: false
  });

  // Category data
  const [backendCategories, setBackendCategories] = useState([]);
  const [categoryIdMap, setCategoryIdMap] = useState({});
  const [subcategoryIdMap, setSubcategoryIdMap] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const backendURL = import.meta.env.VITE_BACKEND_URL || backendUrl;
  const addToCartCalledRef = useRef(false);
  const whatsappButtonRef = useRef(null);

  // Delivery timeline dates
  const deliveryDates = useMemo(() => {
    const today = new Date();
    const orderedDate = new Date(today);
    const readyDate = new Date(today);
    readyDate.setDate(today.getDate() + 1);
    const deliveredDate = new Date(today);
    deliveredDate.setDate(today.getDate() + 3);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return {
      ordered: formatDate(orderedDate),
      readyStart: formatDate(readyDate),
      readyEnd: formatDate(new Date(readyDate.setDate(readyDate.getDate() + 1))),
      deliveredStart: formatDate(deliveredDate),
      deliveredEnd: formatDate(new Date(deliveredDate.setDate(deliveredDate.getDate() + 3)))
    };
  }, []);

  // Toggle expandable sections
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Add shaking animation to WhatsApp button
  useEffect(() => {
    const button = whatsappButtonRef.current;
    if (!button) return;

    const interval = setInterval(() => {
      button.classList.add('animate-shake');
      setTimeout(() => {
        button.classList.remove('animate-shake');
      }, 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendURL}/api/categories`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        let categories = data;
        
        if (data.data && Array.isArray(data.data)) categories = data.data;
        if (data.categories && Array.isArray(data.categories)) categories = data.categories;
        if (!Array.isArray(categories)) throw new Error('Categories data is not an array');

        const idToNameMap = {};
        const subcategoryIdToNameMap = {};

        const transformedCategories = categories.map((cat) => {
          const categoryId = cat._id || cat.id;
          const categoryName = cat.name || cat.categoryName || cat.title || 'Category';
          
          if (categoryId) idToNameMap[categoryId] = categoryName;

          const subcategories = (cat.subcategories || cat.subCategories || []).map((sub) => {
            const subcategoryId = sub._id || sub.id;
            const subcategoryName = sub.name || sub.subcategoryName || sub.title || sub || 'Subcategory';
            
            if (subcategoryId) subcategoryIdToNameMap[subcategoryId] = subcategoryName;
            
            return {
              id: subcategoryId,
              name: subcategoryName
            };
          });

          return {
            id: categoryId,
            name: categoryName,
            subcategories
          };
        });

        setBackendCategories(transformedCategories);
        setCategoryIdMap(idToNameMap);
        setSubcategoryIdMap(subcategoryIdToNameMap);
        setCategoriesError(null);
        
      } catch (error) {
        setCategoriesError(error.message);
        // Fallback
        const categoryMap = {};
        products.forEach(product => {
          if (product && product.category) {
            const categoryName = product.category;
            const subcategoryName = product.subcategory;
            
            if (!categoryMap[categoryName]) {
              categoryMap[categoryName] = {
                name: categoryName,
                subcategories: new Set()
              };
            }
            
            if (subcategoryName) {
              categoryMap[categoryName].subcategories.add(subcategoryName);
            }
          }
        });

        const fallbackCategories = Object.values(categoryMap).map(cat => ({
          name: cat.name,
          subcategories: Array.from(cat.subcategories).map(sub => ({
            name: sub
          }))
        }));
        
        setBackendCategories(fallbackCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (backendURL) {
      fetchCategories();
    } else {
      setCategoriesError('Backend URL configuration missing');
      setLoadingCategories(false);
    }
  }, [backendURL, products]);

  // Helper functions
  const getCategoryName = useCallback((categoryId) => {
    return categoryIdMap[categoryId] || categoryId;
  }, [categoryIdMap]);

  const getSubcategoryName = useCallback((subcategoryId) => {
    return subcategoryIdMap[subcategoryId] || subcategoryId;
  }, [subcategoryIdMap]);

  const maskEmail = useCallback((email) => {
    if (!email || typeof email !== 'string') return 'Unknown User';
    if (email.includes('***@') || !email.includes('@')) return email;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return email;
    
    const [localPart, domain] = email.split('@');
    if (localPart.length === 1) return `${localPart}***@${domain}`;
    
    const firstChar = localPart[0];
    const maskedLocalPart = firstChar + '***';
    return `${maskedLocalPart}@${domain}`;
  }, []);

  const fetchProductDetails = useCallback(async (productId) => {
    if (!productId || !backendURL) return null;
    
    setLoadingProductDetails(true);
    try {
      const response = await fetch(`${backendURL}/api/product/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    } finally {
      setLoadingProductDetails(false);
    }
  }, [backendURL]);

  const fetchProductReviews = useCallback(async (productId) => {
    if (!productId || !backendURL) return;

    setLoadingReviews(true);
    try {
      const response = await fetch(`${backendURL}/api/comments?productId=${productId}`);
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
  }, [backendURL]);

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
      
      fetchProductDetails(productId).then(details => {
        if (details) {
          setProductData(prev => ({
            ...prev,
            ingredients: details.ingredients || [],
            benefits: details.benefits || [],
            howToUse: details.howToUse || '',
            ...(details.quantity !== undefined && { quantity: details.quantity }),
            ...(details.status !== undefined && { status: details.status }),
            ...(details.bestseller !== undefined && { bestseller: details.bestseller }),
          }));
        }
      });
      
      fetchProductReviews(productId);
    } else {
      setError('Product not found');
    }
    setLoading(false);
  }, [productId, products, fetchProductReviews, fetchProductDetails]);

  const stock = productData ? productData.quantity : 0;

  // Get category and subcategory names
  const categoryName = useMemo(() => {
    if (!productData?.category) return null;
    return getCategoryName(productData.category);
  }, [productData, getCategoryName]);

  const subcategoryName = useMemo(() => {
    if (!productData?.subcategory) return null;
    return getSubcategoryName(productData.subcategory);
  }, [productData, getSubcategoryName]);

  // Monitor stock and adjust quantity
  useEffect(() => {
    if (quantity > stock) {
      setQuantity(Math.max(1, stock));
    }
  }, [stock, quantity]);

  const renderStockStatus = useCallback(() => {
    if (stock === 0) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <span className="font-semibold text-red-800">Out of Stock</span>
              <p className="text-sm text-red-600 mt-1">We'll restock soon. Check back later!</p>
            </div>
          </div>
        </div>
      );
    } else if (stock < 5) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div>
              <span className="font-semibold text-red-800">Only {stock} left in stock</span>
              <p className="text-sm text-red-600 mt-1">Limited quantity available. Order now!</p>
            </div>
          </div>
        </div>
      );
    } else if (stock < 10) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <span className="font-semibold text-yellow-800">{stock} items available</span>
              <p className="text-sm text-yellow-600 mt-1">Stock is running low</p>
            </div>
          </div>
        </div>
      );
    } else if (stock < 20) {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <span className="font-semibold text-green-800">Good Stock Available</span>
              <p className="text-sm text-green-600 mt-1">{stock} items ready to ship</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <span className="font-semibold text-green-800">In Stock & Ready to Ship</span>
              <p className="text-sm text-green-600 mt-1">Order now for quick delivery</p>
            </div>
          </div>
        </div>
      );
    }
  }, [stock]);

  const handleQuantityChange = useCallback((e) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    value = Math.min(value, stock);
    setQuantity(value);
  }, [stock]);

  const incrementQuantity = useCallback(() => {
    if (quantity < stock) setQuantity(prev => prev + 1);
  }, [quantity, stock]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  }, [quantity]);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const imageData = files.map(file => ({ file, url: URL.createObjectURL(file) }));
      setReviewImages((prevImages) => [...prevImages, ...imageData]);
    }
  }, []);

  const removeReviewImage = useCallback((index) => {
    if (reviewImages[index]?.url) URL.revokeObjectURL(reviewImages[index].url);
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  }, [reviewImages]);

  const handleSubmitReview = useCallback(async () => {
    if (!user || !user._id) {
      toast.error('Please login to submit a review');
      setIsLoginModalOpen(true);
      setAuthMode('login');
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

      reviewImages.forEach((imageData) => {
        formData.append('reviewImages', imageData.file);
      });

      const currentToken = token || localStorage.getItem('token');
      const response = await fetch(`${backendURL}/api/comments`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${currentToken}` }
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
  }, [user, rating, comment, reviewImages, productId, token, backendURL]);

  const getUserInteractionStatus = useCallback((review) => {
    if (!user || !user._id) return { hasLiked: false, hasDisliked: false };
    const hasLiked = review.likedBy?.includes(user._id) || false;
    const hasDisliked = review.dislikedBy?.includes(user._id) || false;
    return { hasLiked, hasDisliked };
  }, [user]);

  const handleLikeReview = useCallback(async (reviewId) => {
    if (!user || !user._id) {
      toast.error('Please login to like reviews');
      setIsLoginModalOpen(true);
      setAuthMode('login');
      return;
    }

    try {
      const currentToken = token || localStorage.getItem('token');
      const review = reviews.find(r => r.id === reviewId);
      const { hasLiked, hasDisliked } = getUserInteractionStatus(review);
      const endpoint = hasLiked ? 'remove-like' : 'like';
      const method = 'PATCH';

      const response = await fetch(`${backendURL}/api/comments/${reviewId}/${endpoint}`, {
        method,
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });

      if (response.ok) {
        setReviews(prevReviews => prevReviews.map(review => {
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
        }));
      } else {
        toast.error('Failed to update like');
      }
    } catch (error) {
      toast.error('Error updating like');
    }
  }, [user, token, backendURL, reviews, getUserInteractionStatus]);

  const handleDislikeReview = useCallback(async (reviewId) => {
    if (!user || !user._id) {
      toast.error('Please login to dislike reviews');
      setIsLoginModalOpen(true);
      setAuthMode('login');
      return;
    }

    try {
      const currentToken = token || localStorage.getItem('token');
      const review = reviews.find(r => r.id === reviewId);
      const { hasLiked, hasDisliked } = getUserInteractionStatus(review);
      const endpoint = hasDisliked ? 'remove-dislike' : 'dislike';
      const method = 'PATCH';

      const response = await fetch(`${backendURL}/api/comments/${reviewId}/${endpoint}`, {
        method,
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });

      if (response.ok) {
        setReviews(prevReviews => prevReviews.map(review => {
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
        }));
      } else {
        toast.error('Failed to update dislike');
      }
    } catch (error) {
      toast.error('Error updating dislike');
    }
  }, [user, token, backendURL, reviews, getUserInteractionStatus]);

  const handleImageClick = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const toggleShowAllReviews = useCallback(() => {
    setShowAllReviews((prev) => !prev);
  }, []);

  const filterReviewsByRating = useCallback((rating) => {
    if (filterRating === rating) {
      setFilterRating(null);
    } else {
      setFilterRating(rating);
    }
  }, [filterRating]);

  const handleOrderOnWhatsApp = useCallback(() => {
    if (!productData) return;
    
    const message = `Assalam O Alaikum! I would like to order:\n\n` +
                   `*Product:* ${productData.name}\n` +
                   `*Quantity:* ${quantity}\n` +
                   `*Price:* ${currency} ${(productData.discountprice || productData.price) * quantity}\n\n` +
                   `Please let me know the next steps.`;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "923329780355";
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  }, [productData, quantity, currency]);

  const handleAddToCart = useCallback(async () => {
    if (isAddingToCart || addToCartCalledRef.current) return;
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
      const currentCartAmount = getCartAmount?.() || 0;
      const productAmount = (productData.discountprice || productData.price) * finalQuantity;
      const totalAmountAfterAdd = currentCartAmount + productAmount;
      
      addToCart(productData._id, finalQuantity);
      
      const isFreeDelivery = isFreeDeliveryAvailable?.(totalAmountAfterAdd) || false;
      const amountNeeded = getAmountForFreeDelivery?.(totalAmountAfterAdd) || 0;
      
      if (isFreeDelivery) {
        toast.success(
          <div className="flex items-center gap-2">
            <FaCheck className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">Your FREE delivery! 🎉</div>
            </div>
          </div>,
          { autoClose: 4000, className: 'bg-green-50 border border-green-200' }
        );
      } else if (amountNeeded > 0) {
        toast.success(
          <div>
            <div className="text-red-600 font-medium text-sm mt-1">
              Add <strong>{currency} {amountNeeded.toFixed(2)}</strong> more for FREE delivery
            </div>
          </div>,
          { autoClose: 5000, className: 'bg-white border border-red-200' }
        );
      } else {
        toast.success(
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
            <div className="font-semibold">Product added to cart</div>
          </div>,
          { autoClose: 3000, className: 'bg-green-50 border border-green-200' }
        );
      }
      
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add product to cart');
    } finally {
      setTimeout(() => {
        setIsAddingToCart(false);
        addToCartCalledRef.current = false;
      }, 1000);
    }
  }, [isAddingToCart, stock, quantity, productData, getCartAmount, getAmountForFreeDelivery, isFreeDeliveryAvailable, currency]);

  const renderRating = useCallback((ratingValue = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<span key={i} className="text-yellow-400"><FaStar /></span>);
      } else if (i - 0.5 <= ratingValue) {
        stars.push(<span key={i} className="text-yellow-400"><FaStarHalf /></span>);
      } else {
        stars.push(<span key={i} className="text-yellow-400"><FaRegStar /></span>);
      }
    }
    return stars;
  }, []);

  const renderClickableStars = useCallback((currentRating, setRatingFunc) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="cursor-pointer text-yellow-400 text-xl hover:text-yellow-500"
          onClick={() => setRatingFunc(i)}
          aria-label={`Rate ${i} stars`}
        >
          {i <= currentRating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return stars;
  }, []);

  // Product calculations
  const { hasDiscount, actualPrice, originalPrice, discountPercentage } = useMemo(() => {
    const hasDisc = productData?.discountprice !== undefined && 
                   productData?.discountprice !== null && 
                   productData?.discountprice !== productData?.price;
    const actual = hasDisc ? productData?.discountprice : productData?.price;
    const original = hasDisc ? productData?.price : null;
    const discountPct = hasDisc 
      ? Math.round(((productData?.price - productData?.discountprice) / productData?.price) * 100)
      : null;

    return { hasDiscount: hasDisc, actualPrice: actual, originalPrice: original, discountPercentage: discountPct };
  }, [productData]);

  // Helper functions
  const getIngredientsArray = useCallback(() => {
    if (!productData?.ingredients) return [];
    if (Array.isArray(productData.ingredients)) return productData.ingredients.filter(ing => ing && ing.trim() !== '');
    if (typeof productData.ingredients === 'string') {
      return productData.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing !== '');
    }
    return [];
  }, [productData]);

  const getBenefitsArray = useCallback(() => {
    if (!productData?.benefits) return [];
    if (Array.isArray(productData.benefits)) return productData.benefits.filter(benefit => benefit && benefit.trim() !== '');
    if (typeof productData.benefits === 'string') {
      return productData.benefits.split(',').map(benefit => benefit.trim()).filter(benefit => benefit !== '');
    }
    return [];
  }, [productData]);

  const getHowToUseText = useCallback(() => {
    if (!productData?.howToUse) return '';
    return productData.howToUse;
  }, [productData]);

  // Memoized calculations
  const { averageRating, ratingBreakdown } = useMemo(() => {
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((review) => review.rating === star).length,
    }));
    return { averageRating: avgRating, ratingBreakdown: breakdown };
  }, [reviews]);

  const filteredReviews = useMemo(() => 
    filterRating ? reviews.filter((review) => review.rating === filterRating) : reviews
  , [reviews, filterRating]);

  const displayedReviews = useMemo(() => 
    showAllReviews ? filteredReviews : filteredReviews.slice(0, 5)
  , [showAllReviews, filteredReviews]);

  // Error state
  const ErrorState = useMemo(() => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-red-600">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">{error}</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 w-full"
        >
          Go Back
        </button>
      </div>
    </div>
  ), [error]);

  // Loading state
  const LoadingState = useMemo(() => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">Loading product details...</p>
      </div>
    </div>
  ), []);

  if (error) return ErrorState;
  if (loading || !productData) return LoadingState;

  const ingredientsList = getIngredientsArray();
  const benefitsList = getBenefitsArray();
  const howToUseText = getHowToUseText();

  // Add CSS for shake animation
  const style = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
      20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `;

  return (
    <>
      <style>{style}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Product Header */}
          <div className="mb-6 md:mb-8 text-center px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 break-words">
              {productData.name}
            </h1>
            <div className="my-3 flex justify-center gap-1 flex-wrap">
              {categoryName && (
                <span className="text-gray-600 text-base sm:text-lg font-medium">
                  {categoryName}
                  {subcategoryName && ` › ${subcategoryName}`}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Product Images */}
<div className="space-y-6">
  {/* Main Image Card */}
  <div className="bg-white rounded-2xl shadow border border-gray-200 relative overflow-hidden" style={{ height: '600px' }}>
    {discountPercentage && (
      <div className="absolute top-4 left-4 z-10 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">
        {discountPercentage}% OFF
      </div>
    )}
    {productData.bestseller && (
      <div className="absolute top-4 right-4 z-10 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold shadow">
        <FaTag className="inline mr-2" /> BESTSELLER
      </div>
    )}
    <img
      src={image || productData.image?.[0]}
      alt={productData.name}
      className="w-full h-full object-cover"
      loading="eager"
      onError={(e) => {
        e.target.src = 'https://via.placeholder.com/500?text=Product+Image';
      }}
    />
  </div>

  {/* Thumbnails */}
  <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
    <div className="flex gap-3 overflow-x-auto pb-2">
      {productData.image?.map((item, index) => (
        <img
          key={index}
          src={item}
          alt={`${productData.name} thumbnail ${index + 1}`}
          className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer border-2 transition-colors ${
            image === item 
              ? 'border-black' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setImage(item)}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/100?text=Image';
          }}
        />
      ))}
    </div>
  </div>
</div>

            {/* Right Column - Product Info & Actions */}
            <div className="space-y-6">
              {/* Product Info Card */}
              <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
                {/* Price and Rating in Column */}
                <div className="mb-6 space-y-4">
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {currency} {actualPrice.toFixed(2)}
                    </div>
                    {originalPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-gray-500 line-through">
                          {currency} {originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                          Save {discountPercentage}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {renderRating(averageRating)}
                      <span className="ml-1 text-xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">{renderStockStatus()}</div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-800 mb-3">Quantity:</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1 || stock === 0}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaMinus className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-900">{quantity}</span>
                    </div>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= stock || stock === 0}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={stock === 0 || isAddingToCart}
                    className={`w-full py-3 px-4 bg-black text-white font-medium rounded-lg border border-transparent ${
                      stock === 0 || isAddingToCart
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center justify-center gap-3">
                        <FaSpinner className="animate-spin w-5 h-5" />
                        <span>Adding to Cart...</span>
                      </div>
                    ) : stock === 0 ? (
                      'Out of Stock'
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <FaShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </div>
                    )}
                  </button>

                  <button
                    ref={whatsappButtonRef}
                    onClick={handleOrderOnWhatsApp}
                    disabled={stock === 0}
                    className={`w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg border border-transparent flex items-center justify-center gap-3 ${
                      stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    <span>Order on WhatsApp</span>
                  </button>
                </div>

                {/* Delivery Timeline */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    Delivery Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBox className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Ordered</span>
                      </div>
                      <span className="text-sm text-gray-600">{deliveryDates.ordered}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaCheck className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Order Ready</span>
                      </div>
                      <span className="text-sm text-gray-600">{deliveryDates.readyStart} - {deliveryDates.readyEnd}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaTruck className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Delivered</span>
                      </div>
                      <span className="text-sm text-gray-600">{deliveryDates.deliveredStart} - {deliveryDates.deliveredEnd}</span>
                    </div>
                  </div>
                </div>
              </div>
              
           {/* Expandable Sections */}
<div className="space-y-4">
  {/* Description Section */}
  {(productData.description && productData.description.trim() !== '') && (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      <button
        onClick={() => toggleSection('description')}
        className="w-full p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
         
          <h3 className="text-lg font-semibold text-gray-900">Description</h3>
        </div>
        {expandedSections.description ? (
          <FaChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections.description && (
        <div className="p-5 pt-0">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed tracking-wide text-justify">
                {productData.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

  {/* Ingredients Section */}
  {(ingredientsList.length > 0) && (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      <button
        onClick={() => toggleSection('ingredients')}
        className="w-full p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
         
          <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
        </div>
        {expandedSections.ingredients ? (
          <FaChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections.ingredients && (
        <div className="p-5 pt-0">
          {loadingProductDetails ? (
            <div className="flex items-center justify-center p-4">
              <FaSpinner className="animate-spin w-5 h-5 text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {ingredientsList.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium tracking-wide">{ingredient}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )}

  {/* Benefits Section */}
  {(benefitsList.length > 0) && (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      <button
        onClick={() => toggleSection('benefits')}
        className="w-full p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
       
          <h3 className="text-lg font-semibold text-gray-900">Benefits</h3>
        </div>
        {expandedSections.benefits ? (
          <FaChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections.benefits && (
        <div className="p-5 pt-0">
          {loadingProductDetails ? (
            <div className="flex items-center justify-center p-4">
              <FaSpinner className="animate-spin w-5 h-5 text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {benefitsList.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-700 font-medium tracking-wide leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )}

  {/* How to Use Section */}
  {(howToUseText && howToUseText.trim() !== '') && (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      <button
        onClick={() => toggleSection('howToUse')}
        className="w-full p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
       
          <h3 className="text-lg font-semibold text-gray-900">How to Use</h3>
        </div>
        {expandedSections.howToUse ? (
          <FaChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections.howToUse && (
        <div className="p-5 pt-0">
          {loadingProductDetails ? (
            <div className="flex items-center justify-center p-4">
              <FaSpinner className="animate-spin w-5 h-5 text-gray-400" />
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed tracking-wide text-justify whitespace-pre-line">
                  {howToUseText}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>
            </div>

          </div>

          {/* Reviews Section */}
          <div className="mt-8 md:mt-12">
            <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Reviews Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Average Rating */}
                    <div className="text-center md:text-left">
                      <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
                      <div className="flex gap-1 text-2xl mb-2 justify-center md:justify-start">
                        {renderRating(averageRating)}
                      </div>
                      <p className="text-gray-600">Based on {reviews.length} customer reviews</p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="flex-1 max-w-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Breakdown</h3>
                      <div className="space-y-2">
                        {ratingBreakdown.map(({ star, count }) => (
                          <div
                            key={star}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                            onClick={() => filterReviewsByRating(star)}
                          >
                            <div className="flex gap-1 text-sm min-w-[80px]">{renderRating(star)}</div>
                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-yellow-400"
                                style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">({count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Experience</h3>
                  {!user || !user._id ? (
                    <div className="text-center py-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Sign In to Review</h4>
                      <p className="text-gray-600 mb-4">Please login to share your experience with this product</p>
                      <button 
                        onClick={() => {
                          setIsLoginModalOpen(true);
                          setAuthMode('login');
                        }}
                        className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
                      >
                        Sign In Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Your Rating</label>
                        <div className="flex gap-2 text-2xl">
                          {renderClickableStars(rating, setRating)}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Your Review</label>
                        <textarea
                          className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                          rows="3"
                          placeholder="Share your honest thoughts about this product..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                      </div>

                      <button
                        className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                        onClick={handleSubmitReview}
                        disabled={uploading || rating === 0 || !comment.trim()}
                      >
                        {uploading ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Customer Reviews {filterRating && `- ${filterRating} Star${filterRating > 1 ? 's' : ''}`}
                    </h3>
                    {filterRating && (
                      <button
                        onClick={() => setFilterRating(null)}
                        className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                      >
                        Clear Filter
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {loadingReviews ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
                      <p className="text-gray-600 mb-4">Be the first to share your experience!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {displayedReviews.map((review) => {
                        const { hasLiked, hasDisliked } = getUserInteractionStatus(review);
                        return (
                          <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-gray-700">{review.author.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">{maskEmail(review.author)}</span>
                                  <div className="flex gap-1 text-yellow-400">{renderRating(review.rating)}</div>
                                </div>
                                <p className="text-gray-500 text-sm">{review.date}</p>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            
                            <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => handleLikeReview(review.id)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                                  hasLiked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <FaThumbsUp className="w-4 h-4" />
                                <span>{review.likes}</span>
                              </button>
                              <button
                                onClick={() => handleDislikeReview(review.id)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                                  hasDisliked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <FaThumbsDown className="w-4 h-4" />
                                <span>{review.dislikes}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredReviews.length > 5 && (
                        <div className="text-center pt-6">
                          <button
                            onClick={toggleShowAllReviews}
                            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
                          >
                            {showAllReviews ? 'Show Less' : `Load More (${filteredReviews.length - 5}+)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {productData.category && (
            <div className="mt-8 md:mt-12">
              <RelatedProduct category={productData.category} />
            </div>
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full max-h-full">
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-3"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          initialMode={authMode}
        />
      </div>
    </>
  );
};

export default Product;