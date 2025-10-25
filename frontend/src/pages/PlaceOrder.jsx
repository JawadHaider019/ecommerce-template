import React from 'react';
import { useState, useContext, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from "react-router-dom"; 
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from "../assets/assets";

const PlaceOrder = () => {
  const [loading, setLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const {
    backendUrl,
    token,
    user,
    cartItems,
    cartDeals,
    setCartItems,
    setCartDeals,
    getDeliveryCharge,
    products,
    deals,
    getCart
  } = useContext(ShopContext);
  
  const navigate = useNavigate();
  
  // Load form data from localStorage or initialize empty
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('orderFormData');
    return savedData ? JSON.parse(savedData) : {
      firstName: '', lastName: '', email: '', street: '',
      city: '', state: '', zipcode: '', phone: ''
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('orderFormData', JSON.stringify(formData));
  }, [formData]);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!token || !user) {
      sessionStorage.setItem('redirectAfterLogin', '/place-order');
      toast.error('Please login to place an order');
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Get deal products with proper data
  const getDealProducts = (deal) => {
    if (deal.dealProducts?.length > 0) {
      return deal.dealProducts.map(product => {
        const productData = products.find(p => p._id === product._id) || product;
        return { ...productData, quantity: product.quantity || 1 };
      });
    } else if (deal.products?.length > 0) {
      return deal.products.map(productId => {
        const product = products.find(p => p._id === productId);
        return { ...product, quantity: 1 };
      });
    }
    return [];
  };

  // Ensure data is loaded before allowing order placement
  useEffect(() => {
    const hasCartItems = Object.keys(cartItems).length > 0 || Object.keys(cartDeals).length > 0;
    const hasProductsData = products?.length > 0;
    const hasDealsData = deals?.length > 0;
    setIsDataReady(hasCartItems && hasProductsData && hasDealsData);
  }, [cartItems, cartDeals, products, deals]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateCartItems = () => {
    const missingProducts = Object.keys(cartItems).filter(itemId => 
      cartItems[itemId] > 0 && !products?.find(p => p._id === itemId)
    );
    
    const missingDeals = Object.keys(cartDeals).filter(dealId => 
      cartDeals[dealId] > 0 && !deals?.find(d => d._id === dealId)
    );

    return { missingProducts, missingDeals };
  };

  const processCartItems = () => {
    let orderItems = [];
    let calculatedAmount = 0;

    // Process regular products
    Object.entries(cartItems).forEach(([itemId, quantity]) => {
      if (quantity > 0) {
        const productInfo = products?.find(product => product._id === itemId);
        if (productInfo?.name) {
          const unitPrice = productInfo.discountprice > 0 ? productInfo.discountprice : productInfo.price;
          const itemTotal = unitPrice * quantity;
          
          orderItems.push({
            id: productInfo._id,
            name: productInfo.name,
            price: unitPrice,
            quantity: quantity,
            image: productInfo.image?.[0],
            category: productInfo.category,
            isFromDeal: false
          });
          
          calculatedAmount += itemTotal;
        }
      }
    });

    // Process deals
    Object.entries(cartDeals).forEach(([dealId, dealQuantity]) => {
      if (dealQuantity > 0) {
        const dealInfo = deals?.find(deal => deal._id === dealId);
        if (dealInfo?.dealName) {
          const dealProducts = getDealProducts(dealInfo);
          
          dealProducts.forEach(dealProduct => {
            if (dealProduct?._id) {
              const productQuantity = (dealProduct.quantity || 1) * dealQuantity;
              const unitPrice = dealProduct.discountprice > 0 ? dealProduct.discountprice : dealProduct.price;
              const itemTotal = unitPrice * productQuantity;
              const productName = dealProduct.name || `Product from ${dealInfo.dealName}`;
              
              orderItems.push({
                id: dealProduct._id,
                name: productName,
                price: unitPrice,
                quantity: productQuantity,
                image: dealProduct.image?.[0] || assets.placeholder_image,
                category: dealProduct.category,
                isFromDeal: true,
                dealName: dealInfo.dealName,
                dealImage: dealInfo.dealImages?.[0] || assets.placeholder_image,
                dealDescription: dealInfo.dealDescription
              });
              
              calculatedAmount += itemTotal;
            }
          });
        }
      }
    });

    return { orderItems, calculatedAmount };
  };

  const handleMissingItems = (missingProducts, missingDeals) => {
    const updatedCartItems = { ...cartItems };
    const updatedCartDeals = { ...cartDeals };
    
    missingProducts.forEach(productId => delete updatedCartItems[productId]);
    missingDeals.forEach(dealId => delete updatedCartDeals[dealId]);
    
    setCartItems(updatedCartItems);
    setCartDeals(updatedCartDeals);
    
    toast.error('Some items in your cart are no longer available. They have been removed. Please review your cart and try again.');
    setLoading(false);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Double check authentication
    if (!token || !user) {
      sessionStorage.setItem('redirectAfterLogin', '/place-order');
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    
    if (!isDataReady) {
      toast.error('Cart data is still loading. Please wait...');
      return;
    }

    setLoading(true);
    
    try {
      // Validate cart items before proceeding
      const { missingProducts, missingDeals } = validateCartItems();
      
      if (missingProducts.length > 0 || missingDeals.length > 0) {
        handleMissingItems(missingProducts, missingDeals);
        return;
      }

      const { orderItems, calculatedAmount } = processCartItems();
      const deliveryCharge = getDeliveryCharge(calculatedAmount);
      const finalAmount = calculatedAmount + deliveryCharge;

      // Validate order data
      if (orderItems.length === 0) {
        toast.error('Your cart is empty or all items are invalid');
        setLoading(false);
        return;
      }

      if (finalAmount <= 0 || isNaN(finalAmount)) {
        toast.error('Invalid order amount. Please try again.');
        setLoading(false);
        return;
      }

      // Prepare order data
      const orderData = {
        address: formData,
        items: orderItems,
        amount: finalAmount,
        deliveryCharges: deliveryCharge,
        method: 'COD'
      };

      const response = await axios.post(backendUrl + '/api/order/place', orderData, {
        headers: { 
          token: token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Clear cart and saved form data
        setCartItems({});
        setCartDeals({});
        localStorage.removeItem('orderFormData');
        toast.success(response.data.message);
        navigate('/orders');
      } else {
        toast.error(response.data.message || 'Failed to place order');
      }

    } catch (error) {
      handleOrderError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        sessionStorage.setItem('redirectAfterLogin', '/place-order');
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      } else if (error.response.data.message?.includes('not found')) {
        toast.error('Some items in your cart are no longer available. Please refresh your cart and try again.');
        if (token) getCart(token);
      } else {
        toast.error(error.response.data.message || 'Failed to place order');
      }
    } else if (error.request) {
      toast.error('No response from server. Please check your connection.');
    } else {
      toast.error(error.message || 'Failed to place order');
    }
  };

  // Show loading or redirect if not authenticated
  if (!token || !user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  const renderInputField = (name, type = 'text', placeholder, required = true) => (
    <input 
      onChange={onChangeHandler} 
      name={name} 
      value={formData[name]} 
      className='w-full border border-gray-300 px-3.5 py-1.5' 
      type={type}
      placeholder={placeholder}
      required={required}
    />
  );

  return (
    <form onSubmit={onSubmitHandler} className="flex min-h-[80vh] flex-col justify-between gap-4 border-t border-gray-300 pt-5 sm:flex-row sm:pt-14">
      <div className="flex w-full flex-col gap-4 sm:max-w-[480px]">
        <div className="my-3 text-xl sm:text-2xl">
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div> 
        
        <div className='flex gap-3'>
          {renderInputField('firstName', 'text', 'First name')}
          {renderInputField('lastName', 'text', 'Last name')}
        </div>
        
        {renderInputField('email', 'email', 'Email')}
        {renderInputField('street', 'text', 'Address')}
        
        <div className='flex gap-3'>
          {renderInputField('city', 'text', 'City')}
          {renderInputField('state', 'text', 'State')}
        </div>
        
        <div className='flex gap-3'>
          {renderInputField('zipcode', 'number', 'Zipcode')}
          {renderInputField('phone', 'number', 'Phone')}
        </div>
      </div>

      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal/>
        </div>
    
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'}/>
          <div className='flex flex-col gap-3 lg:flex-row'>
            <div className='flex cursor-pointer items-center gap-3 border border-gray-300 p-2 px-3'>
              <p className='mx-4 text-sm font-medium text-gray-500'>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='mt-8 w-full text-end'>
            <button 
              type='submit' 
              className={`bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 active:bg-gray-900 transition-colors w-full md:w-auto text-base ${loading || !isDataReady ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || !isDataReady}
            >
              {loading ? 'PLACING ORDER...' : (!isDataReady ? 'LOADING...' : 'PLACE ORDER')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;