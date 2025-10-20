import React from 'react';
import { useState, useContext } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from "react-router-dom"; 
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const [method, setMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
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
    deals
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

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({...formData, [name]: value});
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("🛒 ========== STARTING ORDER PLACEMENT ==========");
      
      let orderItems = [];
      let calculatedAmount = 0;

      // Debug: Check what's in the cart
      console.log("📦 Cart Items:", cartItems);
      console.log("🎯 Cart Deals:", cartDeals);
      console.log("🛍️ Available Products:", products?.length);
      console.log("🔥 Available Deals:", deals?.length);

      // Process regular products
      for (const itemId in cartItems) {
        const quantity = cartItems[itemId];
        if (quantity > 0) {
          const productInfo = products?.find(product => product._id === itemId);
          console.log(`🔍 Looking for product ${itemId}:`, productInfo);
          
          if (productInfo) {
            const unitPrice = productInfo.discountprice > 0 ? productInfo.discountprice : productInfo.price;
            const itemTotal = unitPrice * quantity;
            
            orderItems.push({
              ...productInfo,
              quantity: quantity,
              itemType: 'product',
              unitPrice: unitPrice,
              itemTotal: itemTotal
            });
            
            calculatedAmount += itemTotal;
            console.log(`✅ Added product: ${productInfo.name}, Qty: ${quantity}, Unit: ${unitPrice}, Total: ${itemTotal}`);
          }
        }
      }

      // Process deals
      for (const dealId in cartDeals) {
        const quantity = cartDeals[dealId];
        if (quantity > 0) {
          const dealInfo = deals?.find(deal => deal._id === dealId);
          console.log(`🔍 Looking for deal ${dealId}:`, dealInfo);
          
          if (dealInfo) {
            const unitPrice = dealInfo.dealFinalPrice || dealInfo.dealTotal || 0;
            const itemTotal = unitPrice * quantity;
            
            orderItems.push({
              ...dealInfo,
              quantity: quantity,
              itemType: 'deal',
              unitPrice: unitPrice,
              itemTotal: itemTotal
            });
            
            calculatedAmount += itemTotal;
            console.log(`✅ Added deal: ${dealInfo.dealName}, Qty: ${quantity}, Unit: ${unitPrice}, Total: ${itemTotal}`);
          }
        }
      }

      // ✅ Calculate delivery fee using the same function as CartTotal
      const deliveryCharge = getDeliveryCharge(calculatedAmount);
      
      // ✅ Calculate final amount with delivery fee
      const finalAmount = calculatedAmount + deliveryCharge;

      console.log("💰 FINAL CALCULATION:");
      console.log("Subtotal (calculated):", calculatedAmount);
      console.log("Delivery Fee:", deliveryCharge);
      console.log("Total Amount:", finalAmount);
      console.log("Number of Order Items:", orderItems.length);

      // Validate that we have items and a valid amount
      if (orderItems.length === 0) {
        toast.error('Your cart is empty');
        setLoading(false);
        return;
      }

      if (finalAmount <= 0 || isNaN(finalAmount)) {
        console.error("❌ Invalid amount calculated:", finalAmount);
        toast.error('Invalid order amount. Please try again.');
        setLoading(false);
        return;
      }

      // ✅ Prepare order data WITH delivery charges
      let orderData = {
        address: formData,
        items: orderItems,
        amount: finalAmount,
        deliveryCharges: deliveryCharge, // ✅ THIS IS CRITICAL - make sure it's included
        method: 'COD'
      };

      console.log("📤 Sending to backend WITH delivery charges:", {
        amount: orderData.amount,
        deliveryCharges: orderData.deliveryCharges, // ✅ Debug delivery charges
        itemsCount: orderData.items.length,
        address: orderData.address ? "Present" : "Missing"
      });

      console.log("🔍 FULL ORDER DATA:", orderData); // ✅ Debug full order data

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
        toast.error(error.response.data.message || 'Failed to place order');
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
    <form onSubmit={onSubmitHandler} className="flex min-h-[80vh] flex-col justify-between gap-4 border-t pt-5 sm:flex-row sm:pt-14">
      <div className="flex w-full flex-col gap-4 sm:max-w-[480px]">
        <div className="my-3 text-xl sm:text-2xl">
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div> 
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='firstName' 
            value={formData.firstName} 
            className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
            type='text'
            placeholder='First name'
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='lastName' 
            value={formData.lastName} 
            className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
            type='text'
            placeholder='Last name'
            required
          />
        </div>
        <input 
          onChange={onChangeHandler} 
          name='email' 
          value={formData.email} 
          className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
          type='email'
          placeholder='Email'
          required
        />
        <input 
          onChange={onChangeHandler} 
          name='street' 
          value={formData.street} 
          className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
          type='text'
          placeholder='Address'
          required
        />
        <div className='flex gap-3'>
          <input 
            onChange={onChangeHandler} 
            name='city' 
            value={formData.city} 
            className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
            type='text'
            placeholder='City'
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='state' 
            value={formData.state} 
            className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
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
            className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
            type='number'
            placeholder='Zipcode'
            required
          />
          <input 
            onChange={onChangeHandler} 
            name='phone' 
            value={formData.phone} 
            className='w-full rounded border border-gray-300 px-3.5 py-1.5' 
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
            <div className='flex cursor-pointer items-center gap-3 border p-2 px-3'>
              <p className='mx-4 text-sm font-medium text-gray-500'>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='mt-8 w-full text-end'>
            <button 
              type='submit' 
              className={`btn ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;