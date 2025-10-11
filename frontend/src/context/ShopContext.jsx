import { createContext, useState, useMemo, useCallback, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';
export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const CURRENCY = "Rs. ";
  const DELIVERY_FEE = 250;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/product/list`);
      
      if (response.data?.products) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data?.message || "No products found");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!token && localStorage.getItem('token')) {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      getCart(storedToken);
    }
  }, []);

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

  const getCartTotal = useCallback(() => 
    getCartSubtotal() + DELIVERY_FEE
  , [getCartSubtotal]);

  const contextValue = useMemo(() => ({
    // State
    products,
    isLoading,
    currency: CURRENCY,
    deliveryFee: DELIVERY_FEE,
    search,
    showSearch,
    cartItems,
    backendUrl: BACKEND_URL,
    
    // Search handlers
    setSearch,
    setShowSearch,
    token,
    setToken,
    
    // Cart handlers
    addToCart,
    setCartItems,
    getCartCount: getCartItemCount,
    updateQuantity: updateCartItemQuantity,
    getCartAmount: getCartSubtotal,
    getTotalDiscount: getTotalDiscount,
    getTotalAmount: getCartTotal,
    getCart, // Expose getCart function
    
    // Data fetching
    refetchProducts: fetchProducts
  }), [
    products,
    isLoading,
    search,
    showSearch,
    cartItems,
    addToCart,
    getCartItemCount,
    updateCartItemQuantity,
    getCartSubtotal,
    getTotalDiscount,
    getCartTotal,
    fetchProducts,
    BACKEND_URL,
    token,
    getCart
  ]);

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;