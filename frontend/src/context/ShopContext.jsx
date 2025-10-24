import { createContext, useState, useMemo, useCallback, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../components/Loader';

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
  
  const [loading, setLoading] = useState({
    products: { status: false, message: "Loading products..." },
    categories: { status: false, message: "Loading categories..." },
    deals: { status: false, message: "Loading deals..." },
    general: { status: false, message: "Updating data..." },
    cart: { status: false, message: "Updating cart..." },
    reviews: { status: false, message: "Loading reviews..." },
    user: { status: false, message: "Loading user data..." }
  });

  const setLoadingState = useCallback((key, status, message = null) => {
    setLoading(prev => ({
      ...prev,
      [key]: {
        status,
        message: message || prev[key]?.message || "Loading..."
      }
    }));
  }, []);

  const isLoadingAny = useCallback(() => {
    return Object.values(loading).some(item => item.status === true);
  }, [loading]);

  const getLoadingMessage = useCallback(() => {
    const activeLoaders = Object.entries(loading).filter(([_, item]) => item.status);
    if (activeLoaders.length > 0) {
      return activeLoaders[0][1].message;
    }
    return "Loading...";
  }, [loading]);

  const decodeToken = useCallback((token) => {
    try {
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    setLoadingState('user', true, "Loading user profile...");
    try {
      const decoded = decodeToken(token);
      
      if (decoded && decoded.id) {
        setUser({
          _id: decoded.id,
          isLoggedIn: true
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setLoadingState('user', false);
    }
  }, [token, decodeToken, setLoadingState]);

  const fetchDeliverySettings = useCallback(async () => {
    setDeliverySettingsLoading(true);
    setLoadingState('general', true, "Loading delivery settings...");
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
      setLoadingState('general', false);
    }
  }, [BACKEND_URL, setLoadingState]);

  const updateDeliverySettings = useCallback(async (settings) => {
    setLoadingState('general', true, "Updating delivery settings...");
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
    } finally {
      setLoadingState('general', false);
    }
  }, [BACKEND_URL, setLoadingState]);

  const calculateAverageRating = useCallback((reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    
    const validRatings = reviews.filter(review => review.rating && review.rating > 0);
    if (validRatings.length === 0) return 0;
    
    const totalRating = validRatings.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / validRatings.length;
    
    return Math.round(average * 10) / 10;
  }, []);

  const fetchProductReviews = useCallback(async (productId) => {
    setLoadingState('reviews', true, "Loading product reviews...");
    try {
      const response = await axios.get(`${BACKEND_URL}/api/comments?productId=${productId}`);
      
      if (response.data) {
        const reviews = response.data.map(comment => ({
          id: comment._id,
          rating: comment.rating,
          comment: comment.content,
          images: comment.reviewImages?.map(img => img.url) || [],
          date: new Date(comment.date).toLocaleDateString(),
          author: comment.email,
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
    } finally {
      setLoadingState('reviews', false);
    }
  }, [BACKEND_URL, setLoadingState]);

  const fetchDealReviews = useCallback(async (dealId) => {
    setLoadingState('reviews', true, "Loading deal reviews...");
    try {
      const response = await axios.get(`${BACKEND_URL}/api/comments?dealId=${dealId}`);
      
      if (response.data) {
        const reviews = response.data.map(comment => ({
          id: comment._id,
          rating: comment.rating,
          comment: comment.content,
          images: comment.reviewImages?.map(img => img.url) || [],
          date: new Date(comment.date).toLocaleDateString(),
          author: comment.email,
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
    } finally {
      setLoadingState('reviews', false);
    }
  }, [BACKEND_URL, setLoadingState]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadingState('products', true, "Loading products...");
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
      setLoadingState('products', false);
    }
  }, [BACKEND_URL, fetchProductReviews, calculateAverageRating, setLoadingState]);

  const fetchDeals = useCallback(async () => {
    setDealsLoading(true);
    setLoadingState('deals', true, "Loading deals...");
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
      setLoadingState('deals', false);
    }
  }, [BACKEND_URL, fetchDealReviews, calculateAverageRating, setLoadingState]);

  const submitReview = useCallback(async (reviewData) => {
    if (!token) {
      toast.error("Please login to submit a review");
      return false;
    }

    setLoadingState('general', true, "Submitting review...");
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
    } finally {
      setLoadingState('general', false);
    }
  }, [token, BACKEND_URL, fetchProductReviews, fetchProducts, decodeToken, setLoadingState]);

  const submitDealReview = useCallback(async (reviewData) => {
    if (!token) {
      toast.error("Please login to submit a review");
      return false;
    }

    setLoadingState('general', true, "Submitting review...");
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
    } finally {
      setLoadingState('general', false);
    }
  }, [token, BACKEND_URL, fetchDealReviews, fetchDeals, decodeToken, setLoadingState]);

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

  const isFreeDeliveryAvailable = useCallback((subtotal = 0) => {
    const { freeDeliveryAbove } = deliverySettings;
    return freeDeliveryAbove > 0 && subtotal < freeDeliveryAbove;
  }, [deliverySettings]);

  const getAmountForFreeDelivery = useCallback((subtotal = 0) => {
    const { freeDeliveryAbove } = deliverySettings;
    if (freeDeliveryAbove > 0 && subtotal < freeDeliveryAbove) {
      return freeDeliveryAbove - subtotal;
    }
    return 0;
  }, [deliverySettings]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchProducts();
    fetchDeals();
    fetchDeliverySettings();
  }, [fetchProducts, fetchDeals, fetchDeliverySettings]);

  useEffect(() => {
    if (token) {
      getCart(token);
    }
  }, [token]);

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
      setLoadingState('cart', true, "Updating cart...");
      try {
        await axios.post(
          `${BACKEND_URL}/api/cart/update-deal`,
          { dealId, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update deal quantity");
      } finally {
        setLoadingState('cart', false);
      }
    }
  }, [token, BACKEND_URL, deals, setLoadingState]);

  const removeDealFromCart = useCallback(async (dealId) => {
    await updateDealQuantity(dealId, 0);
  }, [updateDealQuantity]);

  const addDealToCart = useCallback(async (dealId, quantity = 1) => {
    if (!dealId || quantity < 1) {
      return;
    }

    const deal = deals.find(d => d._id === dealId);
    
    if (!deal) {
      toast.error("Deal not found");
      return;
    }

    const currentQuantity = cartDeals[dealId] || 0;
    if (deal.quantity && deal.quantity < currentQuantity + quantity) {
      toast.error(`Only ${deal.quantity} items available for this deal`);
      return;
    }

    setCartDeals(prev => ({
      ...prev,
      [dealId]: (prev[dealId] || 0) + quantity
    }));

    if (token) {
      setLoadingState('cart', true, "Adding to cart...");
      try {
        await axios.post(
          `${BACKEND_URL}/api/cart/add-deal`,
          { dealId, quantity },
          { headers: { token } }
        );
        toast.success("Deal added to cart!");
      } catch (error) {
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
      } finally {
        setLoadingState('cart', false);
      }
    } else {
      toast.success("Deal added to cart!");
    }
  }, [token, BACKEND_URL, deals, cartDeals, setLoadingState]);

  const addToCart = useCallback(async (itemId, quantity = 1, itemType = 'product') => {
    if (itemType === 'deal') {
      await addDealToCart(itemId, quantity);
    } else {
      if (!itemId || quantity < 1) return;

      setCartItems(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + quantity
      }));

      if (token) {
        setLoadingState('cart', true, "Adding to cart...");
        try {
          await axios.post(
            `${BACKEND_URL}/api/cart/add`,
            { itemId, quantity },
            { headers: { token } }
          );
          toast.success("Product added to cart!");
        } catch (error) {
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
        } finally {
          setLoadingState('cart', false);
        }
      } else {
        toast.success("Product added to cart!");
      }
    }
  }, [token, BACKEND_URL, addDealToCart, setLoadingState]);

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
        setLoadingState('cart', true, "Updating cart...");
        try {
          await axios.post(
            `${BACKEND_URL}/api/cart/update`,
            { itemId, quantity },
            { headers: { token } }
          );
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoadingState('cart', false);
        }
      }
    }
  }, [token, BACKEND_URL, updateDealQuantity, setLoadingState]);

  const getCart = useCallback(async (token) => {
    setLoadingState('cart', true, "Loading cart...");
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
    } finally {
      setLoadingState('cart', false);
    }
  }, [BACKEND_URL, setLoadingState]);

  const getCartItemCount = useCallback(() => {
    const productCount = Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
    const dealCount = Object.values(cartDeals).reduce((total, quantity) => total + quantity, 0);
    return productCount + dealCount;
  }, [cartItems, cartDeals]);

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

  const getCartTotal = useCallback(() => {
    const subtotal = getCartSubtotal();
    const deliveryCharge = getDeliveryCharge(subtotal);
    return subtotal + deliveryCharge;
  }, [getCartSubtotal, getDeliveryCharge]);

  const getDealById = useCallback((dealId) => {
    return deals.find(deal => deal._id === dealId);
  }, [deals]);

  const isDealInCart = useCallback((dealId) => {
    return cartDeals[dealId] > 0;
  }, [cartDeals]);

  const getDealQuantityInCart = useCallback((dealId) => {
    return cartDeals[dealId] || 0;
  }, [cartDeals]);

  const contextValue = useMemo(() => ({
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
    loading,
    isLoadingAny,
    setLoadingState,
    setSearch,
    setShowSearch,
    setToken,
    setUser,
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
    loading,
    isLoadingAny,
    setLoadingState,
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
      {isLoadingAny() && <Loader message={getLoadingMessage()} />}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;