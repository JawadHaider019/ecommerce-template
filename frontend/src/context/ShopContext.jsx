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
  const [cartDeals, setCartDeals] = useState({});
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [productReviews, setProductReviews] = useState({});
  const [dealReviews, setDealReviews] = useState({});
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
      
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      console.log('Decoded token:', decoded);
      
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

  // Calculate average rating for a product or deal
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

  // Fetch deal reviews and store them
  const fetchDealReviews = useCallback(async (dealId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/comments?dealId=${dealId}`);
      
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

        setDealReviews(prev => ({
          ...prev,
          [dealId]: reviews
        }));

        return reviews;
      }
      return [];
    } catch (error) {
      console.error("Error fetching deal reviews:", error);
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

  // Fetch deals from backend with ratings
  const fetchDeals = useCallback(async () => {
    setDealsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/deal/list`);
      
      if (response.data?.success) {
        const dealsData = response.data.deals || [];
        
        const currentDate = new Date();
        const activeDeals = dealsData.filter((deal) => {
          const isPublished = deal.status === 'published';
          const isActive = (!deal.dealStartDate || new Date(deal.dealStartDate) <= currentDate) &&
                          (!deal.dealEndDate || new Date(deal.dealEndDate) >= currentDate);
          
          return isPublished && isActive;
        });

        const dealsWithRatings = await Promise.all(
          activeDeals.map(async (deal) => {
            try {
              const reviews = await fetchDealReviews(deal._id);
              const averageRating = calculateAverageRating(reviews);
              const reviewCount = reviews.length;

              return {
                ...deal,
                rating: averageRating,
                reviewCount: reviewCount
              };
            } catch (error) {
              console.error(`Error processing deal ${deal._id}:`, error);
              return {
                ...deal,
                rating: 0,
                reviewCount: 0
              };
            }
          })
        );
        
        setDeals(dealsWithRatings);
        return dealsWithRatings;
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
  }, [BACKEND_URL, fetchDealReviews, calculateAverageRating]);

  // Submit product review
  const submitReview = useCallback(async (reviewData) => {
    if (!token) {
      toast.error("Please login to submit a review");
      return false;
    }

    try {
      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        toast.error("Invalid token");
        return false;
      }

      const formData = new FormData();
      formData.append('targetType', 'product');
      formData.append('productId', reviewData.productId);
      formData.append('content', reviewData.comment);
      formData.append('rating', reviewData.rating);
      formData.append('userId', decoded.id);

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
  }, [token, BACKEND_URL, fetchProductReviews, fetchProducts, decodeToken]);

  // Submit deal review
  const submitDealReview = useCallback(async (reviewData) => {
    if (!token) {
      toast.error("Please login to submit a review");
      return false;
    }

    try {
      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        toast.error("Invalid token");
        return false;
      }

      const formData = new FormData();
      formData.append('targetType', 'deal');
      formData.append('dealId', reviewData.dealId);
      formData.append('content', reviewData.comment);
      formData.append('rating', reviewData.rating);
      formData.append('userId', decoded.id);

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
        await fetchDealReviews(reviewData.dealId);
        await fetchDeals();
        
        toast.success("Review submitted successfully!");
        return true;
      }
    } catch (error) {
      console.error("Error submitting deal review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
      return false;
    }
  }, [token, BACKEND_URL, fetchDealReviews, fetchDeals, decodeToken]);

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

  // Get deal rating and review count
  const getDealRatingInfo = useCallback((dealId) => {
    const deal = deals.find(d => d._id === dealId);
    if (deal) {
      return {
        rating: deal.rating || 0,
        reviewCount: deal.reviewCount || 0
      };
    }
    return { rating: 0, reviewCount: 0 };
  }, [deals]);

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

  // Update deal quantity in cart
  const updateDealQuantity = useCallback(async (dealId, quantity) => {
    if (!dealId || quantity < 0) return;

    const deal = deals.find(d => d._id === dealId);
    if (quantity > 0 && deal?.quantity && quantity > deal.quantity) {
      toast.error(`Only ${deal.quantity} items available for this deal`);
      return;
    }

    setCartDeals(prev => {
      const updated = { ...prev };
      
      if (quantity === 0) {
        delete updated[dealId];
      } else {
        updated[dealId] = quantity;
      }
      
      return updated;
    });

    if (token) {
      try {
        await axios.post(
          `${BACKEND_URL}/api/cart/update-deal`,
          { dealId, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update deal quantity");
      }
    }
  }, [token, BACKEND_URL, deals]);

  // Remove deal from cart
  const removeDealFromCart = useCallback(async (dealId) => {
    await updateDealQuantity(dealId, 0);
  }, [updateDealQuantity]);

  // Add deal to cart
  const addDealToCart = useCallback(async (dealId, quantity = 1) => {
    console.log('🎯 addDealToCart called:', { dealId, quantity });
    
    if (!dealId || quantity < 1) {
      console.log('❌ Invalid deal ID or quantity');
      return;
    }

    const deal = deals.find(d => d._id === dealId);
    console.log('🔍 Deal found:', deal);
    
    if (!deal) {
      toast.error("Deal not found");
      return;
    }

    const currentQuantity = cartDeals[dealId] || 0;
    if (deal.quantity && deal.quantity < currentQuantity + quantity) {
      toast.error(`Only ${deal.quantity} items available for this deal`);
      return;
    }

    console.log('🔄 Updating cartDeals state');
    setCartDeals(prev => ({
      ...prev,
      [dealId]: (prev[dealId] || 0) + quantity
    }));

    if (token) {
      try {
        console.log('📡 Making API call to add deal to cart');
        const response = await axios.post(
          `${BACKEND_URL}/api/cart/add-deal`,
          { dealId, quantity },
          { headers: { token } }
        );
        console.log('✅ API Response:', response.data);
        toast.success("Deal added to cart!");
      } catch (error) {
        console.error('❌ API Error:', error);
        toast.error(error.response?.data?.message || "Failed to add deal to cart");
        setCartDeals(prev => {
          const updated = { ...prev };
          if (updated[dealId] <= quantity) {
            delete updated[dealId];
          } else {
            updated[dealId] -= quantity;
          }
          return updated;
        });
      }
    } else {
      toast.success("Deal added to cart!");
    }
  }, [token, BACKEND_URL, deals, cartDeals]);

  // Enhanced addToCart with debugging
  const addToCart = useCallback(async (itemId, quantity = 1, itemType = 'product') => {
    console.log('🛒 addToCart called:', { itemId, quantity, itemType });
    
    if (itemType === 'deal') {
      console.log('🎯 Routing to deal cart');
      await addDealToCart(itemId, quantity);
    } else {
      console.log('📦 Routing to product cart');
      if (!itemId || quantity < 1) return;

      console.log('🔄 Updating cartItems state');
      setCartItems(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + quantity
      }));

      if (token) {
        try {
          console.log('📡 Making API call to add product to cart');
          const response = await axios.post(
            `${BACKEND_URL}/api/cart/add`,
            { itemId, quantity },
            { headers: { token } }
          );
          console.log('✅ API Response:', response.data);
          toast.success("Product added to cart!");
        } catch (error) {
          console.error('❌ API Error:', error);
          toast.error(error.response?.data?.message || "Failed to add product to cart");
          setCartItems(prev => {
            const updated = { ...prev };
            if (updated[itemId] <= quantity) {
              delete updated[itemId];
            } else {
              updated[itemId] -= quantity;
            }
            return updated;
          });
        }
      } else {
        toast.success("Product added to cart!");
      }
    }
  }, [token, BACKEND_URL, addDealToCart]);

  // Enhanced update cart item quantity
  const updateCartItemQuantity = useCallback(async (itemId, quantity, itemType = 'product') => {
    if (itemType === 'deal') {
      await updateDealQuantity(itemId, quantity);
    } else {
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
    }
  }, [token, BACKEND_URL, updateDealQuantity]);

  // Enhanced getCart to handle both products and deals
  const getCart = useCallback(async (token) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/cart/`,
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData?.products || {});
        setCartDeals(response.data.cartData?.deals || {});
      } else {
        toast.error(response.data.message || "Failed to load cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error(error.response?.data?.message || "Failed to fetch cart");
    }
  }, [BACKEND_URL]);

  // Enhanced cart item count
  const getCartItemCount = useCallback(() => {
    const productCount = Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
    const dealCount = Object.values(cartDeals).reduce((total, quantity) => total + quantity, 0);
    return productCount + dealCount;
  }, [cartItems, cartDeals]);

  // Enhanced subtotal calculation to include deals
  const getCartSubtotal = useCallback(() => {
    const productSubtotal = Object.entries(cartItems).reduce((total, [id, quantity]) => {
      const product = products.find(p => p._id === id);
      return product && quantity > 0 ? total + (product.discountprice || product.price) * quantity : total;
    }, 0);

    const dealSubtotal = Object.entries(cartDeals).reduce((total, [id, quantity]) => {
      const deal = deals.find(d => d._id === id);
      return deal && quantity > 0 ? total + (deal.dealFinalPrice || deal.dealTotal) * quantity : total;
    }, 0);

    return productSubtotal + dealSubtotal;
  }, [cartItems, cartDeals, products, deals]);

  // Enhanced total discount calculation to include deals
  const getTotalDiscount = useCallback(() => {
    const productDiscount = Object.entries(cartItems).reduce((total, [id, quantity]) => {
      const product = products.find(p => p._id === id);
      
      if (!product || !product.discountprice || quantity <= 0) return total;
      
      const discountAmount = product.price * (product.discountprice / 100);
      return total + discountAmount * quantity;
    }, 0);

    const dealDiscount = Object.entries(cartDeals).reduce((total, [id, quantity]) => {
      const deal = deals.find(d => d._id === id);
      
      if (!deal || !deal.dealFinalPrice || quantity <= 0) return total;
      
      const discountAmount = (deal.dealTotal - deal.dealFinalPrice) * quantity;
      return total + discountAmount;
    }, 0);

    return productDiscount + dealDiscount;
  }, [cartItems, cartDeals, products, deals]);

  // Get cart total (includes delivery)
  const getCartTotal = useCallback(() => {
    const subtotal = getCartSubtotal();
    const deliveryCharge = getDeliveryCharge(subtotal);
    return subtotal + deliveryCharge;
  }, [getCartSubtotal, getDeliveryCharge]);

  // Get deal by ID
  const getDealById = useCallback((dealId) => {
    return deals.find(deal => deal._id === dealId);
  }, [deals]);

  // Check if deal is in cart
  const isDealInCart = useCallback((dealId) => {
    return cartDeals[dealId] > 0;
  }, [cartDeals]);

  // Get deal quantity in cart
  const getDealQuantityInCart = useCallback((dealId) => {
    return cartDeals[dealId] || 0;
  }, [cartDeals]);

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
    cartDeals,
    backendUrl: BACKEND_URL,
    user,
    productReviews,
    dealReviews,
    token,
    
    // Search handlers
    setSearch,
    setShowSearch,
    setToken,
    setUser,
    
    // Cart handlers
    addToCart,
    addDealToCart,
    removeDealFromCart,
    setCartItems,
    setCartDeals,
    getCartCount: getCartItemCount,
    updateQuantity: updateCartItemQuantity,
    updateDealQuantity,
    getCartAmount: getCartSubtotal,
    getTotalDiscount: getTotalDiscount,
    getTotalAmount: getCartTotal,
    getCart,
    
    // Deal cart helpers
    getDealById,
    isDealInCart,
    getDealQuantityInCart,
    
    // Delivery handlers
    getDeliveryCharge,
    isFreeDeliveryAvailable,
    getAmountForFreeDelivery,
    updateDeliverySettings,
    fetchDeliverySettings,
    
    // Rating and Review handlers
    fetchProductReviews,
    fetchDealReviews,
    submitReview,
    submitDealReview,
    getProductRatingInfo,
    getDealRatingInfo,
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
    cartDeals,
    user,
    productReviews,
    dealReviews,
    token,
    addToCart,
    addDealToCart,
    removeDealFromCart,
    getCartItemCount,
    updateCartItemQuantity,
    updateDealQuantity,
    getCartSubtotal,
    getTotalDiscount,
    getCartTotal,
    getDealById,
    isDealInCart,
    getDealQuantityInCart,
    getDeliveryCharge,
    isFreeDeliveryAvailable,
    getAmountForFreeDelivery,
    updateDeliverySettings,
    fetchDeliverySettings,
    fetchProductReviews,
    fetchDealReviews,
    submitReview,
    submitDealReview,
    getProductRatingInfo,
    getDealRatingInfo,
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

export default ShopContextProvider; // ✅ Make sure this export exists