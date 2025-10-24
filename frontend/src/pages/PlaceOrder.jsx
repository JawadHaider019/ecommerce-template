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
  const [method, setMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const {
    backendUrl,
    token,
    cartItems,
    cartDeals,
    setCartItems,
    setCartDeals,
    getCartAmount,
    getDeliveryCharge,
    products,
    deals,
    getCart
  } = useContext(ShopContext);
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    phone: ''
  });

  // Get deal products with proper data
  const getDealProducts = (deal) => {
    console.log("🔄 Processing deal for products:", {
      dealName: deal.dealName,
      dealProducts: deal.dealProducts,
      products: deal.products,
      dealImages: deal.dealImages
    });

    if (deal.dealProducts && deal.dealProducts.length > 0) {
      return deal.dealProducts.map(product => {
        const productData = products.find(p => p._id === product._id) || product;
        console.log("📦 Found deal product:", {
          name: productData?.name,
          image: productData?.image,
          quantity: product.quantity,
          foundInProducts: !!products.find(p => p._id === product._id)
        });
        return {
          ...productData,
          quantity: product.quantity || 1
        };
      });
    } else if (deal.products && deal.products.length > 0) {
      return deal.products.map(productId => {
        const product = products.find(p => p._id === productId);
        console.log("📦 Found product from deal array:", {
          name: product?.name,
          image: product?.image,
          found: !!product
        });
        return {
          ...product,
          quantity: 1
        };
      });
    }
    
    console.log("❌ No products found in deal");
    return [];
  };

  // Ensure data is loaded before allowing order placement
  useEffect(() => {
    const checkDataReady = () => {
      const hasCartItems = Object.keys(cartItems).length > 0 || Object.keys(cartDeals).length > 0;
      const hasProductsData = products && products.length > 0;
      const hasDealsData = deals && deals.length > 0;
      
      setIsDataReady(hasCartItems && hasProductsData && hasDealsData);
    };

    checkDataReady();
  }, [cartItems, cartDeals, products, deals]);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({...formData, [name]: value});
  };

  const validateCartItems = () => {
    const missingProducts = [];
    const missingDeals = [];

    // Check products
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const product = products?.find(p => p._id === itemId);
        if (!product) {
          missingProducts.push(itemId);
        }
      }
    }

    // Check deals
    for (const dealId in cartDeals) {
      if (cartDeals[dealId] > 0) {
        const deal = deals?.find(d => d._id === dealId);
        if (!deal) {
          missingDeals.push(dealId);
        }
      }
    }

    return { missingProducts, missingDeals };
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!isDataReady) {
      toast.error('Cart data is still loading. Please wait...');
      return;
    }

    setLoading(true);
    
    try {
      console.log("🛒 ========== STARTING ORDER PLACEMENT ==========");
      
      // Validate cart items before proceeding
      const { missingProducts, missingDeals } = validateCartItems();
      
      if (missingProducts.length > 0 || missingDeals.length > 0) {
        console.log("❌ Missing items found:", { missingProducts, missingDeals });
        
        // Remove missing items from cart
        const updatedCartItems = { ...cartItems };
        const updatedCartDeals = { ...cartDeals };
        
        missingProducts.forEach(productId => {
          delete updatedCartItems[productId];
        });
        
        missingDeals.forEach(dealId => {
          delete updatedCartDeals[dealId];
        });
        
        setCartItems(updatedCartItems);
        setCartDeals(updatedCartDeals);
        
        toast.error('Some items in your cart are no longer available. They have been removed. Please review your cart and try again.');
        setLoading(false);
        return;
      }

      let orderItems = [];
      let calculatedAmount = 0;

      console.log("📦 Cart Items:", cartItems);
      console.log("🎯 Cart Deals:", cartDeals);

      // Debug: Check all deals data
      console.log("🎯 ALL DEALS DATA:", deals?.map(deal => ({
        id: deal._id,
        name: deal.dealName,
        images: deal.dealImages,
        products: deal.dealProducts || deal.products,
        hasDealImages: !!deal.dealImages,
        dealImagesCount: deal.dealImages?.length || 0
      })));

      // Process regular products
      for (const itemId in cartItems) {
        const quantity = cartItems[itemId];
        if (quantity > 0) {
          const productInfo = products?.find(product => product._id === itemId);
          console.log(`🔍 Looking for product ${itemId}:`, productInfo);
          
          if (productInfo && productInfo.name) {
            const unitPrice = productInfo.discountprice > 0 ? productInfo.discountprice : productInfo.price;
            const itemTotal = unitPrice * quantity;
            
            // ✅ Send product data
            orderItems.push({
              id: productInfo._id,
              name: productInfo.name,
              price: unitPrice,
              quantity: quantity,
              image: productInfo.image?.[0],
              category: productInfo.category,
              isFromDeal: false // ✅ Explicitly mark as not from deal
            });
            
            calculatedAmount += itemTotal;
            console.log(`✅ Added product: ${productInfo.name}, Qty: ${quantity}, Unit: ${unitPrice}, Total: ${itemTotal}`);
          } else {
            console.log(`❌ Skipping invalid product: ${itemId}`, productInfo);
          }
        }
      }

      // Process deals - FLATTEN DEALS INTO INDIVIDUAL PRODUCTS
      for (const dealId in cartDeals) {
        const dealQuantity = cartDeals[dealId];
        if (dealQuantity > 0) {
          const dealInfo = deals?.find(deal => deal._id === dealId);
          console.log(`🔍 Looking for deal ${dealId}:`, dealInfo);
          
          if (dealInfo && dealInfo.dealName) {
            const dealProducts = getDealProducts(dealInfo);
            console.log(`📦 Deal contains ${dealProducts.length} products:`, dealProducts);
            
            // Process each product in the deal
            dealProducts.forEach(dealProduct => {
              if (dealProduct && dealProduct._id) {
                const productQuantity = (dealProduct.quantity || 1) * dealQuantity;
                const unitPrice = dealProduct.discountprice > 0 ? dealProduct.discountprice : dealProduct.price;
                const itemTotal = unitPrice * productQuantity;
                
                // ✅ FIXED: Ensure product name is never undefined
                const productName = dealProduct.name || `Product from ${dealInfo.dealName}`;
                
                // ✅ Send individual product data from deal
                orderItems.push({
                  id: dealProduct._id,
                  name: productName, // ✅ ENSURED: Name is never undefined
                  price: unitPrice,
                  quantity: productQuantity,
                  image: dealProduct.image?.[0] || assets.placeholder_image,
                  category: dealProduct.category,
                  isFromDeal: true, // ✅ MARK AS FROM DEAL
                  dealName: dealInfo.dealName, // ✅ Reference to original deal
                  dealImage: dealInfo.dealImages?.[0] || assets.placeholder_image, // ✅ Deal image
                  dealDescription: dealInfo.dealDescription // ✅ Deal description
                });
                
                calculatedAmount += itemTotal;
                console.log(`✅ Added deal product: ${productName}, Qty: ${productQuantity}, Unit: ${unitPrice}, Total: ${itemTotal} (from deal: ${dealInfo.dealName})`);
              } else {
                console.log(`❌ Invalid deal product:`, dealProduct);
              }
            });
          } else {
            console.log(`❌ Skipping invalid deal: ${dealId}`, dealInfo);
          }
        }
      }

      // ✅ Calculate delivery fee
      const deliveryCharge = getDeliveryCharge(calculatedAmount);
      const finalAmount = calculatedAmount + deliveryCharge;

      console.log("💰 FINAL CALCULATION:");
      console.log("Subtotal (calculated):", calculatedAmount);
      console.log("Delivery Fee:", deliveryCharge);
      console.log("Total Amount:", finalAmount);
      console.log("Number of Order Items:", orderItems.length);

      // ✅ Debug: Check what's being sent to backend
      console.log("🔍 FINAL ORDER ITEMS DEBUG:", orderItems.map(item => ({
        name: item.name,
        isFromDeal: item.isFromDeal,
        dealName: item.dealName,
        dealImage: item.dealImage,
        image: item.image,
        type: item.isFromDeal ? 'DEAL_ITEM' : 'REGULAR_ITEM'
      })));

      // Validate that we have items and a valid amount
      if (orderItems.length === 0) {
        toast.error('Your cart is empty or all items are invalid');
        setLoading(false);
        return;
      }

      if (finalAmount <= 0 || isNaN(finalAmount)) {
        console.error("❌ Invalid amount calculated:", finalAmount);
        toast.error('Invalid order amount. Please try again.');
        setLoading(false);
        return;
      }

      // ✅ Prepare order data
      let orderData = {
        address: formData,
        items: orderItems,
        amount: finalAmount,
        deliveryCharges: deliveryCharge,
        method: 'COD'
      };

      console.log("📤 Sending to backend:", {
        amount: orderData.amount,
        deliveryCharges: orderData.deliveryCharges,
        itemsCount: orderData.items.length,
        items: orderData.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          isFromDeal: item.isFromDeal || false,
          dealName: item.dealName || null,
          dealImage: item.dealImage || null,
          type: item.isFromDeal ? 'DEAL_ITEM' : 'REGULAR_ITEM'
        }))
      });

      const response = await axios.post(backendUrl + '/api/order/place', orderData, {
        headers: { 
          token: token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Backend Response:", response.data);
      
      if (response.data.success) {
        // Clear both cart items and cart deals
        setCartItems({});
        setCartDeals({});
        toast.success(response.data.message);
        navigate('/orders');
      } else {
        toast.error(response.data.message || 'Failed to place order');
      }

    } catch (error) {
      console.log('❌ ORDER PLACEMENT ERROR:', error);
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        
        // Handle specific backend errors
        if (error.response.data.message?.includes('not found')) {
          toast.error('Some items in your cart are no longer available. Please refresh your cart and try again.');
          // Refresh cart to sync with server
          if (token) {
            getCart(token);
          }
        } else {
          toast.error(error.response.data.message || 'Failed to place order');
        }
      } else if (error.request) {
        console.log('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.log('Error message:', error.message);
        toast.error(error.message || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex min-h-[80vh] flex-col justify-between gap-4 border-t border-gray-300 pt-5 sm:flex-row sm:pt-14">
      <div className="flex w-full flex-col gap-4 sm:max-w-[480px]">
        <div className="my-3 text-xl sm:text-2xl">
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div> 
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='firstName' 
            value={formData.firstName} 
            className='w-full border border-gray-300 px-3.5 py-1.5' 
            type='text'
            placeholder='First name'
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='lastName' 
            value={formData.lastName} 
            className='w-full border border-gray-300 px-3.5 py-1.5' 
            type='text'
            placeholder='Last name'
            required
          />
        </div>
        <input 
          onChange={onChangeHandler} 
          name='email' 
          value={formData.email} 
          className='w-full border border-gray-300 px-3.5 py-1.5' 
          type='email'
          placeholder='Email'
          required
        />
        <input 
          onChange={onChangeHandler} 
          name='street' 
          value={formData.street} 
          className='w-full border border-gray-300 px-3.5 py-1.5' 
          type='text'
          placeholder='Address'
          required
        />
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='city' 
            value={formData.city} 
            className='w-full border border-gray-300 px-3.5 py-1.5' 
            type='text'
            placeholder='City'
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='state' 
            value={formData.state} 
            className='w-full border border-gray-300 px-3.5 py-1.5' 
            type='text'
            placeholder='State'
            required
          />
        </div>
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='zipcode' 
            value={formData.zipcode} 
            className='w-full border border-gray-300 px-3.5 py-1.5' 
            type='number'
            placeholder='Zipcode'
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='phone' 
            value={formData.phone} 
            className='w-full border border-gray-300 px-3.5 py-1.5' 
            type='number'
            placeholder='Phone'
            required
          />
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