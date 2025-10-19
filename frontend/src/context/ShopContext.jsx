import { createContext, useState, useMemo, useCallback, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const CURRENCY = "Rs. ";
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [productReviews, setProductReviews] = useState({});
  const [deliverySettings, setDeliverySettings] = useState({
    mode: "fixed",
    fixedCharge: 250,
    freeDeliveryAbove: 0
  });
  const [deliverySettingsLoading, setDeliverySettingsLoading] = useState(false);

  // Function to decode JWT token and get user info
  const decodeToken = useCallback((token) => {
    try {
      if (!token) return null;
      
      // JWT token has 3 parts: header.payload.signature
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      console.log('Decoded token:', decoded); // Debug log
      
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  // Fetch user data from token
  const fetchUserData = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded = decodeToken(token);
      
      if (decoded && decoded.id) {
        // Create a basic user object from the token
        // Note: This won't have user name/email, but at least we know they're logged in
        setUser({
          _id: decoded.id,
          isLoggedIn: true
        });
        console.log('User set from token:', decoded.id);
      } else {
        console.log('No user ID found in token');
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    }
  }, [token, decodeToken]);

  // Fetch delivery settings from backend
  const fetchDeliverySettings = useCallback(async () => {
    setDeliverySettingsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/delivery-settings`);
      if (response.data) {
        setDeliverySettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching delivery settings:", error);
      toast.error("Failed to load delivery settings");
    } finally {
      setDeliverySettingsLoading(false);
    }
  }, [BACKEND_URL]);

  // Update delivery settings (admin function)
  const updateDeliverySettings = useCallback(async (settings) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/delivery-settings`, settings);
      if (response.data) {
        setDeliverySettings(response.data.settings);
        toast.success("Delivery settings updated successfully");
        return true;
      }
    } catch (error) {
      console.error("Error updating delivery settings:", error);
      toast.error(error.response?.data?.error || "Failed to update delivery settings");
      return false;
    }
  }, [BACKEND_URL]);

  // Calculate average rating for a product
  const calculateAverageRating = useCallback((reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    
    const validRatings = reviews.filter(review => review.rating && review.rating > 0);
    if (validRatings.length === 0) return 0;
    
    const totalRating = validRatings.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / validRatings.length;
    
    return Math.round(average * 10) / 10;
  }, []);

  // Fetch product reviews and store them
  const fetchProductReviews = useCallback(async (productId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/comments?productId=${productId}`);
      
      if (response.data) {
        const reviews = response.data.map(comment => ({
          id: comment._id,
          rating: comment.rating,
          comment: comment.content,
          images: comment.reviewImages?.map(img => img.url) || [],
          date: new Date(comment.date).toLocaleDateString(),
          author: comment.author || 'Anonymous',
          likes: comment.likes || 0,
          dislikes: comment.dislikes || 0
        }));

        setProductReviews(prev => ({
          ...prev,
          [productId]: reviews
        }));

        return reviews;
      }
      return [];
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      return [];
    }
  }, [BACKEND_URL]);

  // Fetch all products with their ratings
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/product/list`);
      
      if (response.data?.products) {
        const productsData = response.data.products;
        
        const productsWithRatings = await Promise.all(
          productsData.map(async (product) => {
            try {
              const reviews = await fetchProductReviews(product._id);
              const averageRating = calculateAverageRating(reviews);
              const reviewCount = reviews.length;

              return {
                ...product,
                rating: averageRating,
                reviewCount: reviewCount
              };
            } catch (error) {
              console.error(`Error processing product ${product._id}:`, error);
              return { 
                ...product, 
                rating: 0, 
                reviewCount: 0 
              };
            }
          })
        );
        
        setProducts(productsWithRatings);
      } else {
        toast.error(response.data?.message || "No products found");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL, fetchProductReviews, calculateAverageRating]);

  // Fetch deals from backend
  const fetchDeals = useCallback(async () => {
    setDealsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/deals/list`);
      
      if (response.data?.success) {
        const dealsData = response.data.deals || [];
        
        const currentDate = new Date();
        const activeDeals = dealsData.filter((deal) => {
          const isPublished = deal.status === 'published';
          const isActive = (!deal.dealStartDate || new Date(deal.dealStartDate) <= currentDate) &&
                          (!deal.dealEndDate || new Date(deal.dealEndDate) >= currentDate);
          
          return isPublished && isActive;
        });
        
        setDeals(activeDeals);
        return activeDeals;
      } else {
        toast.error(response.data?.message || "No deals found");
        return [];
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error(error.response?.data?.message || "Failed to fetch deals");
      return [];
    } finally {
      setDealsLoading(false);
    }
  }, [BACKEND_URL]);

  // Submit review
  const submitReview = useCallback(async (reviewData) => {
    if (!token) {
      toast.error("Please login to submit a review");
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('targetType', 'product');
      formData.append('productId', reviewData.productId);
      formData.append('content', reviewData.comment);
      formData.append('rating', reviewData.rating);

      // Append images if any
      reviewData.images.forEach((imageData, index) => {
        formData.append('reviewImages', imageData.file);
      });

      const response = await axios.post(`${BACKEND_URL}/api/comments`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        await fetchProductReviews(reviewData.productId);
        await fetchProducts();
        
        toast.success("Review submitted successfully!");
        return true;
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
      return false;
    }
  }, [token, BACKEND_URL, fetchProductReviews, fetchProducts]);

  // Get product rating and review count
  const getProductRatingInfo = useCallback((productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      return {
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0
      };
    }
    return { rating: 0, reviewCount: 0 };
  }, [products]);

  // Calculate delivery charge based on cart subtotal
  const getDeliveryCharge = useCallback((subtotal = 0) => {
    const { mode, fixedCharge, freeDeliveryAbove } = deliverySettings;
    
    if (freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove) {
      return 0;
    }
    
    if (mode === "fixed") {
      return fixedCharge;
    }
    
    return fixedCharge;
  }, [deliverySettings]);

  // Check if free delivery is available for current cart
  const isFreeDeliveryAvailable = useCallback((subtotal = 0) => {
    const { freeDeliveryAbove } = deliverySettings;
    return freeDeliveryAbove > 0 && subtotal < freeDeliveryAbove;
  }, [deliverySettings]);

  // Get amount needed for free delivery
  const getAmountForFreeDelivery = useCallback((subtotal = 0) => {
    const { freeDeliveryAbove } = deliverySettings;
    if (freeDeliveryAbove > 0 && subtotal < freeDeliveryAbove) {
      return freeDeliveryAbove - subtotal;
    }
    return 0;
  }, [deliverySettings]);

  // Initialize token from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      console.log('Token loaded from localStorage:', storedToken);
    }
  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchDeals();
    fetchDeliverySettings();
  }, [fetchProducts, fetchDeals, fetchDeliverySettings]);

  // Get cart when token is available
  useEffect(() => {
    if (token) {
      getCart(token);
    }
  }, [token]);

  const addToCart = useCallback(async (itemId, quantity = 1) => {
    if (!itemId || quantity < 1) return;

    setCartItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + quantity
    }));

    if (token) {
      try {
        await axios.post(
          `${BACKEND_URL}/api/cart/add`,
          { itemId, quantity },   
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  }, [token, BACKEND_URL]);

  const updateCartItemQuantity = useCallback(async(itemId, quantity) => {
    if (!itemId || quantity < 0) return;
    
    setCartItems(prev => {
      const updated = { ...prev };
      
      if (quantity === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = quantity;
      }
      
      return updated;
    });
    
    if (token) {
      try {
        await axios.post(
          `${BACKEND_URL}/api/cart/update`,
          { itemId, quantity },   
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  }, [token, BACKEND_URL]);

  const getCart = useCallback(async (token) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/cart/`,
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        toast.error(response.data.message || "Failed to load cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error.response?.data?.message || "Failed to fetch cart");
    }
  }, [BACKEND_URL]);

  const getCartItemCount = useCallback(() => 
    Object.values(cartItems).reduce((total, quantity) => total + quantity, 0)
  , [cartItems]);

  const getCartSubtotal = useCallback(() => 
    Object.entries(cartItems).reduce((total, [id, quantity]) => {
      const product = products.find(p => p._id === id);
      return product && quantity > 0 ? total + (product.discountprice || product.price) * quantity : total;
    }, 0)
  , [cartItems, products]);

  const getTotalDiscount = useCallback(() =>
    Object.entries(cartItems).reduce((total, [id, quantity]) => {
      const product = products.find(p => p._id === id);
      
      if (!product || !product.discountprice || quantity <= 0) return total;
      
      const discountAmount = product.price * (product.discountprice / 100);
      return total + discountAmount * quantity;
    }, 0)
  , [cartItems, products]);

  const getCartTotal = useCallback(() => {
    const subtotal = getCartSubtotal();
    const deliveryCharge = getDeliveryCharge(subtotal);
    return subtotal + deliveryCharge;
  }, [getCartSubtotal, getDeliveryCharge]);

  const contextValue = useMemo(() => ({
    // State
    products,
    deals,
    isLoading,
    dealsLoading,
    currency: CURRENCY,
    deliverySettings,
    search,
    showSearch,
    cartItems,
    backendUrl: BACKEND_URL,
    user,
    productReviews,
    token,
    
    // Search handlers
    setSearch,
    setShowSearch,
    setToken,
    setUser,
    
    // Cart handlers
    addToCart,
    setCartItems,
    getCartCount: getCartItemCount,
    updateQuantity: updateCartItemQuantity,
    getCartAmount: getCartSubtotal,
    getTotalDiscount: getTotalDiscount,
    getTotalAmount: getCartTotal,
    getCart,
    
    // Delivery handlers
    getDeliveryCharge,
    isFreeDeliveryAvailable,
    getAmountForFreeDelivery,
    updateDeliverySettings,
    fetchDeliverySettings,
    
    // Rating and Review handlers
    fetchProductReviews,
    submitReview,
    getProductRatingInfo,
    calculateAverageRating,
    
    // Data fetching
    refetchProducts: fetchProducts,
    refetchDeals: fetchDeals
  }), [
    products,
    deals,
    isLoading,
    dealsLoading,
    deliverySettings,
    search,
    showSearch,
    cartItems,
    user,
    productReviews,
    token,
    addToCart,
    getCartItemCount,
    updateCartItemQuantity,
    getCartSubtotal,
    getTotalDiscount,
    getCartTotal,
    getDeliveryCharge,
    isFreeDeliveryAvailable,
    getAmountForFreeDelivery,
    updateDeliverySettings,
    fetchDeliverySettings,
    fetchProductReviews,
    submitReview,
    getProductRatingInfo,
    calculateAverageRating,
    fetchProducts,
    fetchDeals,
    BACKEND_URL,
    getCart
  ]);

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;