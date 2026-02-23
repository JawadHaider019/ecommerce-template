import { useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FaShoppingCart, 
  FaPlus, 
  FaMinus,
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
  const navigate = useNavigate();
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

  // Category and Subcategory state
  const [backendCategories, setBackendCategories] = useState([]);
  const [categoryIdMap, setCategoryIdMap] = useState({});
  const [subcategoryIdMap, setSubcategoryIdMap] = useState({});
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [changingSubcategory, setChangingSubcategory] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL || backendUrl;
  const addToCartCalledRef = useRef(false);
  const buyNowButtonRef = useRef(null);

  // SIMPLE LOADING STATE - JUST CHECK IF PRODUCTS EXIST
  const isLoading = !products || products.length === 0 || !productData;

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
  
useEffect(() => {
  const button = buyNowButtonRef.current;
  if (!button) return;
  
  button.classList.add('animate-float-shake');
  console.log('Button classes after adding:', button.className);
  
  return () => {
    button.classList.remove('animate-float-shake');
  };
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
        
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (backendURL) {
      fetchCategories();
    }
  }, [backendURL]);

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
        body: JSON.stringify({ productId })
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
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [backendURL]);

  // Set available subcategories based on current product's category
  useEffect(() => {
    if (productData?.category && backendCategories.length > 0) {
      const categoryId = productData.category;
      const category = backendCategories.find(cat => cat.id === categoryId);
      
      if (category && category.subcategories && category.subcategories.length > 0) {
        setAvailableSubcategories(category.subcategories);
        
        // Set initial selected subcategory to current product's subcategory
        if (productData.subcategory) {
          const subcatId = productData.subcategory;
          const subcat = category.subcategories.find(sub => sub.id === subcatId);
          if (subcat) {
            setSelectedSubcategory(subcat.id);
          } else {
            setSelectedSubcategory('');
          }
        }
      } else {
        setAvailableSubcategories([]);
        setSelectedSubcategory('');
      }
    }
  }, [productData, backendCategories]);

  // SIMPLIFIED PRODUCT DATA FETCHING
  useEffect(() => {
    if (!productId) {
      setError('Product ID not found');
      return;
    }

    // If products are loaded, find the product
    if (products && products.length > 0) {
      const product = products.find((item) => item._id === productId);
      if (product) {
        setProductData(product);
        setImage(product.image?.[0] || '');
        setError(null);
        
        // Fetch additional details
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
    }
  }, [productId, products, fetchProductDetails, fetchProductReviews]);

// Handle subcategory change (for radio buttons) - OPTIMIZED VERSION
const handleSubcategoryChange = useCallback(async (subcategoryId) => {
  if (!subcategoryId || !productData?.category || changingSubcategory) return;
  
  // If it's the same as current, do nothing
  if (subcategoryId === selectedSubcategory) return;
  
  setSelectedSubcategory(subcategoryId);
  
  try {
    const categoryId = productData.category;
    
    // Find the product with this subcategory
    const newProduct = products.find(p => 
      p.category === categoryId && 
      p.subcategory === subcategoryId
    );
    
    if (newProduct) {
      // Instant navigation - no delay
      navigate(`/product/${newProduct._id}`);
    }
    // No else condition needed - if no product found, selection remains
  } catch (error) {
    console.error('Error changing subcategory:', error);
    toast.error('Failed to change subcategory');
  }
}, [productData, products, navigate, selectedSubcategory]);

// Also update the variant product finding to use useMemo for better performance
const variantProducts = useMemo(() => {
  if (!productData?.category || !products.length) return {};
  
  const variants = {};
  availableSubcategories.forEach(subcat => {
    const variant = products.find(p => 
      p.category === productData.category && 
      p.subcategory === subcat.id
    );
    if (variant) {
      variants[subcat.id] = variant;
    }
  });
  return variants;
}, [productData, products, availableSubcategories]);
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
    const phoneNumber = "923260325457";
    
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


const handleBuyNow = useCallback(() => {
  if (stock === 0) {
    toast.error('This product is out of stock');
    return;
  }
  
  // Show loading state
  setIsAddingToCart(true);
  
  // Add to cart first
  addToCart(productData._id, quantity);
  
  // Small delay to ensure cart is updated
  setTimeout(() => {
    // Navigate to checkout page
    navigate('/place-order');
    setIsAddingToCart(false);
  }, 500);
  
}, [productData, quantity, stock, addToCart, navigate]);

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

  // LOADING STATE
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  const ingredientsList = getIngredientsArray();
  const benefitsList = getBenefitsArray();
  const howToUseText = getHowToUseText();

const style = `
@keyframes floatShake {
  0% { transform: translateX(0); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  10% { transform: translateX(-2px); box-shadow: 0 8px 12px rgba(53, 83, 55, 0.2); }
  20% { transform: translateX(2px); box-shadow: 0 12px 18px rgba(53, 83, 55, 0.3); }
  30% { transform: translateX(-2px); box-shadow: 0 8px 12px rgba(53, 83, 55, 0.2); }
  40% { transform: translateX(0); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  90% { transform: translateX(2px); box-shadow: 0 8px 12px rgba(53, 83, 55, 0.2); }
  100% { transform: translateX(0); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
}
.animate-float-shake {
  animation: floatShake 2s ease-in infinite;
}
`;
  return (
    <>
      <style>{style}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-8xl mx-auto px-2 py-6 md:py-8">
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
<div className="space-y-4 md:space-y-6">
  {/* Main Image Card */}
  <div className="bg-white rounded-2xl shadow border border-gray-200 relative overflow-hidden" 
       style={{ height: 'auto', minHeight: '300px', maxHeight: '600px' }}>
    {discountPercentage && (
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-green-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow">
        {discountPercentage}% OFF
      </div>
    )}
    {productData.bestseller && (
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-black text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow">
        <FaTag className="inline mr-1 md:mr-2 text-xs md:text-sm" /> 
        <span className="hidden xs:inline">BESTSELLER</span>
        <span className="xs:hidden">BEST</span>
      </div>
    )}
    <img
      src={image || productData.image?.[0]}
      alt={productData.name}
      className="w-full h-full object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px]"
      loading="eager"
      onError={(e) => {
        e.target.src = 'https://via.placeholder.com/500?text=Product+Image';
      }}
    />
  </div>

  {/* Thumbnails */}
  <div className="bg-white rounded-2xl shadow border border-gray-200 p-2 md:p-4">
    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {productData.image?.map((item, index) => (
        <img
          key={index}
          src={item}
          alt={`${productData.name} thumbnail ${index + 1}`}
          className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-lg cursor-pointer border-2 transition-colors flex-shrink-0 ${
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
  <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 sm:p-6">
    {/* Price and Rating in Column */}
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-2 sm:mb-0">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900">
            {currency} {actualPrice.toFixed(2)}
          </div>
          {originalPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base sm:text-lg text-gray-500 line-through">
                {currency} {originalPrice.toFixed(2)}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs sm:text-sm font-medium">
                Save {discountPercentage}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderRating(averageRating)}
            <span className="ml-1 text-lg sm:text-xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            ({reviews.length})
          </span>
        </div>
      </div>

      {/* Variants Section - Responsive */}
      {availableSubcategories.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs sm:text-sm font-medium text-gray-800 mb-3 uppercase tracking-wide">
            More Variants
          </p>
          <div className="space-y-2">
            {availableSubcategories.map((subcat) => {
              const variantProduct = variantProducts[subcat.id] || productData;
              
              const hasDisc = variantProduct.discountprice !== undefined && 
                            variantProduct.discountprice !== null && 
                            variantProduct.discountprice !== variantProduct.price;
              
              const variantPrice = hasDisc ? variantProduct.discountprice : variantProduct.price;
              const variantOriginalPrice = hasDisc ? variantProduct.price : null;
              
              const isSelected = selectedSubcategory === subcat.id;
              
              return (
                <label
                  key={subcat.id}
                  onClick={() => handleSubcategoryChange(subcat.id)}
                  className={`
                    relative p-3 sm:p-4 rounded-lg border-2 transition-all duration-150
                    flex items-center justify-between w-full cursor-pointer
                    ${isSelected 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:shadow'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="subcategory"
                    value={subcat.id}
                    checked={isSelected}
                    onChange={() => {}}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  
                  {/* Left side - Radio indicator and name */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`
                      w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150 flex-shrink-0
                      ${isSelected ? 'border-white' : 'border-gray-400'}
                    `}>
                      {isSelected && <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-sm sm:text-base font-medium">{subcat.name}</span>
                  </div>
                  
                  {/* Right side - Price */}
                  <div className="flex sm:flex-row flex-col items-center gap-1 sm:gap-2">
                    <span className="font-bold text-sm sm:text-base">
                      {currency} {variantPrice.toFixed(2)}
                    </span>
                    {variantOriginalPrice && (
                      <span className={`text-xs line-through ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                        {currency} {variantOriginalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>

    {/* Stock Status */}
    <div className="mb-6">{renderStockStatus()}</div>

    {/* Quantity Selector - Centered on Mobile */}
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-800 mb-3 text-center sm:text-left">Quantity:</p>
      <div className="flex items-center justify-center sm:justify-start gap-4">
        <button
          onClick={decrementQuantity}
          disabled={quantity <= 1 || stock === 0}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <FaMinus className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <div className="text-center min-w-[40px]">
          <span className="text-2xl font-bold text-gray-900">{quantity}</span>
        </div>
        <button
          onClick={incrementQuantity}
          disabled={quantity >= stock || stock === 0}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>

    {/* Action Buttons - Stack on Mobile */}
    <div className="space-y-3 mb-6">
      <button
        onClick={handleAddToCart}
        disabled={stock === 0 || isAddingToCart}
        className={`w-full py-3 px-4 bg-black text-white font-medium rounded-lg border border-transparent transition-all ${
          stock === 0 || isAddingToCart
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-800 active:scale-[0.98]'
        }`}
      >
        {isAddingToCart ? (
          <div className="flex items-center justify-center gap-3">
            <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Adding to Cart...</span>
          </div>
        ) : stock === 0 ? (
          <span className="text-sm sm:text-base">Out of Stock</span>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <FaShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Add to Cart</span>
          </div>
        )}
      </button>
      {/* Buy Now Button - Direct checkout */}

<button
  onClick={handleBuyNow}
   ref={buyNowButtonRef} 
  disabled={stock === 0 || isAddingToCart}
  className={`w-full py-3 px-4 bg-[#355337] text-white font-medium rounded-lg border border-transparent flex items-center justify-center gap-3 transition-all ${
    stock === 0 || isAddingToCart 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:bg-[#426444] active:scale-[0.98]'
  }`}
>
  {isAddingToCart ? (
    <div className="flex items-center justify-center gap-3">
      <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-sm sm:text-base">Processing...</span>
    </div>
  ) : (
    <>
      <FaBox className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-sm sm:text-base">Buy Now</span>
    </>
  )}
</button>

      <button
        onClick={handleOrderOnWhatsApp}
        disabled={stock === 0}
        className={`w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg border border-transparent flex items-center justify-center gap-3 transition-all ${
          stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700 active:scale-[0.98]'
        }`}
      >
        <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Order on WhatsApp</span>
      </button>
    </div>

    {/* Delivery Timeline - Responsive Grid */}
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
        <FaCalendarAlt className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm sm:text-base">Delivery Timeline</span>
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBox className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">Ordered</span>
          </div>
          <span className="text-xs sm:text-sm text-gray-600">{deliveryDates.ordered}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">Order Ready</span>
          </div>
          <span className="text-xs sm:text-sm text-gray-600">{deliveryDates.readyStart} - {deliveryDates.readyEnd}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaTruck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">Delivered</span>
          </div>
          <span className="text-xs sm:text-sm text-gray-600">{deliveryDates.deliveredStart} - {deliveryDates.deliveredEnd}</span>
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
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Description</h3>
          </div>
          {expandedSections.description ? (
            <FaChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          )}
        </button>
        {expandedSections.description && (
          <div className="p-4 sm:p-5 pt-0">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="prose prose-xs sm:prose-sm max-w-none">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify">
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
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Ingredients</h3>
          </div>
          {expandedSections.ingredients ? (
            <FaChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          )}
        </button>
        {expandedSections.ingredients && (
          <div className="p-4 sm:p-5 pt-0">
            {loadingProductDetails ? (
              <div className="flex items-center justify-center p-4">
                <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {ingredientsList.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">{ingredient}</span>
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
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Benefits</h3>
          </div>
          {expandedSections.benefits ? (
            <FaChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          )}
        </button>
        {expandedSections.benefits && (
          <div className="p-4 sm:p-5 pt-0">
            {loadingProductDetails ? (
              <div className="flex items-center justify-center p-4">
                <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {benefitsList.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-1 h-1 sm:w-2 sm:h-2 bg-green-600 rounded-full mt-1.5 sm:mt-2"></div>
                    <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">{benefit}</span>
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
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">How to Use</h3>
          </div>
          {expandedSections.howToUse ? (
            <FaChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          ) : (
            <FaChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          )}
        </button>
        {expandedSections.howToUse && (
          <div className="p-4 sm:p-5 pt-0">
            {loadingProductDetails ? (
              <div className="flex items-center justify-center p-4">
                <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
            ) : (
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="prose prose-xs sm:prose-sm max-w-none">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line">
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