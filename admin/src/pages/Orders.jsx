import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Central unauthorized handler
  const handleUnauthorized = (endpoint) => {
    console.error(
      `❌ Unauthorized while calling ${endpoint}. Token:`,
      token ? token.substring(0, 15) + '...' : 'EMPTY'
    );
    toast.error('Session expired. Please login again.');
    logout();
    navigate('/');
  };

  // 📦 Fetch all orders
  const fetchAllOrders = async () => {
    if (!token) {
      handleUnauthorized('/api/order/list');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/order/list`, {
        headers: { token },
      });

      if (response.data.success) {
        console.log('📦 Raw orders data from API:', response.data.orders);
        setOrders(response.data.orders || []);
      } else if (
        response.data.message?.includes('Not Authorized') ||
        response.status === 401
      ) {
        handleUnauthorized('/api/order/list');
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes('Not Authorized')
      ) {
        handleUnauthorized('/api/order/list');
      } else {
        console.error('💥 Error fetching orders:', error);
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Update order status
  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;

    if (!token) {
      handleUnauthorized('/api/order/status');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Order status updated');
        fetchAllOrders();
      } else if (
        response.data.message?.includes('Not Authorized') ||
        response.status === 401
      ) {
        handleUnauthorized('/api/order/status');
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes('Not Authorized')
      ) {
        handleUnauthorized('/api/order/status');
      } else {
        console.error('💥 Error updating status:', error);
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  // 🧭 Load orders when token changes
  useEffect(() => {
    if (token) {
      fetchAllOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Helper function to get item name
  const getItemName = (item) => {
    if (item.itemType === 'deal') {
      return item.dealName || 'Deal Item';
    }
    return item.name || 'Product Item';
  };

  // Helper function to get item price
  const getItemPrice = (item) => {
    if (item.itemType === 'deal') {
      return item.unitPrice || item.dealFinalPrice || 0;
    }
    return item.discountprice || item.price || 0;
  };

  // Helper function to get original price for deals
  const getOriginalPrice = (item) => {
    if (item.itemType === 'deal') {
      return item.dealTotal || item.unitPrice || 0;
    }
    return item.price || item.discountprice || 0;
  };

  // Helper function to calculate item total
  const calculateItemTotal = (item) => {
    const price = getItemPrice(item);
    const quantity = item.quantity || 1;
    return price * quantity;
  };

  

  // 🌀 Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // If no token and not loading, show message
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <img src={assets.parcel_icon} alt="No access" className="opacity-50" />
          </div>
          <p className="text-gray-500 text-lg mb-4">Please login to view orders</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 📋 Render orders
  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-left">Order Management</h3>

        {orders.length === 0 ? (
          <div className="text-center py-2">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <img src={assets.parcel_icon} alt="No orders" className="opacity-50" />
            </div>
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              // Separate regular items and deal items based on itemType
              const regularItems = order.items?.filter(item => item.itemType !== 'deal') || [];
              const dealItems = order.items?.filter(item => item.itemType === 'deal') || [];
              const allItems = [...regularItems, ...dealItems];
              
              const subtotal = allItems.reduce(
                (sum, item) => sum + calculateItemTotal(item),
                0
              );
              const total = subtotal + (order.deliveryCharges || 0);

              console.log(`🔍 Order ${order._id}:`, {
                regularItems: regularItems.length,
                dealItems: dealItems.length,
                dealItemsData: dealItems
              });

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                    order.status === 'Cancelled' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  {/* Header */}
                  <div className={`px-6 py-4 border-b ${
                    order.status === 'Cancelled' ? 'bg-red-100 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center">
                        <img 
                          src={order.status === 'Cancelled' ? assets.cross_icon : assets.parcel_icon} 
                          alt="Order" 
                          className="h-8 w-8 mr-3" 
                        />
                        <div>
                          <h4 className={`text-lg font-semibold ${
                            order.status === 'Cancelled' ? 'text-red-800' : 'text-gray-800'
                          }`}>
                            Order #{order._id.substring(0, 7)}
                            {order.status === 'Cancelled' && (
                              <span className="ml-2 text-sm bg-red-200 text-red-800 px-2 py-1 rounded-full">
                                Cancelled
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">ID: {order._id}</p>
                          {order.cancellationReason && (
                            <p className="text-sm text-red-600 mt-1">
                              Cancellation Reason: {order.cancellationReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end mt-2 sm:mt-0">
                        <span className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items */}
                    <div>
                      <h5 className="text-md font-medium text-gray-700 mb-3">
                        Order Items ({allItems.length})
                        {dealItems.length > 0 && (
                          <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            {dealItems.length} deal{dealItems.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </h5>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                        {allItems.map((item, idx) => {
                          const isDeal = item.itemType === 'deal';
                          const itemTotal = calculateItemTotal(item);
                          const itemPrice = getItemPrice(item);
                          const originalPrice = getOriginalPrice(item);
                          const hasDiscount = originalPrice > itemPrice;

                          return (
                            <div
                              key={idx}
                              className={`flex justify-between items-center py-3 border-b border-gray-100 last:border-0 ${
                                isDeal ? 'bg-orange-50 border-l-4 border-l-orange-400 pl-3' : ''
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="font-medium text-sm text-gray-900">
                                    {getItemName(item)}
                                  </p>
                                  {isDeal && (
                                    <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                                      DEAL
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Qty: {item.quantity || 1}
                                </p>
                                {isDeal && item.dealDescription && (
                                  <p className="text-xs text-orange-600 mt-1 line-clamp-2">
                                    {item.dealDescription}
                                  </p>
                                )}
                                {isDeal && item.dealProducts && (
                                  <div className="mt-1">
                                    <p className="text-xs text-gray-600 font-medium">Includes:</p>
                                    {item.dealProducts.map((product, pIdx) => (
                                      <p key={pIdx} className="text-xs text-gray-500 ml-2">
                                        • {product.name} (Qty: {product.quantity})
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right min-w-20">
                                <p className="text-sm font-medium text-gray-900">
                                  {currency}
                                  {itemTotal.toFixed(2)}
                                </p>
                                {hasDiscount && itemPrice > 0 && (
                                  <p className="text-xs line-through text-gray-400">
                                    {currency}
                                    {(originalPrice * (item.quantity || 1)).toFixed(2)}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {currency}
                                  {itemPrice.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Deal Items Summary */}
                      {dealItems.length > 0 && (
                        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <h6 className="text-sm font-medium text-orange-800 mb-2">
                            Deal Items Summary
                          </h6>
                          <div className="text-xs text-orange-700 space-y-1">
                            <div className="flex justify-between">
                              <span>Number of deal items:</span>
                              <span className="font-medium">{dealItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total deal savings:</span>
                              <span className="font-medium">
                                {currency}
                                {dealItems.reduce((sum, item) => {
                                  const originalPrice = getOriginalPrice(item);
                                  const discountPrice = getItemPrice(item);
                                  const quantity = item.quantity || 1;
                                  const savings = (originalPrice - discountPrice) * quantity;
                                  return sum + savings;
                                }, 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address & Payment */}
                    <div>
                      <h5 className="text-md font-medium text-gray-700 mb-3">Delivery Address</h5>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm">
                        <p className="font-medium">
                          {order.address?.firstName} {order.address?.lastName}
                        </p>
                        <p>{order.address?.street}</p>
                        <p>
                          {order.address?.city}, {order.address?.state}
                        </p>
                        <p>{order.address?.zipcode}</p>
                        <p className="mt-2">📞 {order.address?.phone}</p>
                      </div>

                      <div className="mt-6">
                        <h5 className="text-md font-medium text-gray-700 mb-3">
                          Payment Information
                        </h5>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-sm">
                          <div className="flex justify-between">
                            <span>Method:</span>
                            <span className="font-medium capitalize">{order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span>Status:</span>
                            <span
                              className={`font-medium ${
                                order.payment ? 'text-green-600' : 'text-yellow-600'
                              }`}
                            >
                              {order.payment ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary & Status */}
                    <div>
                      <h5 className="text-md font-medium text-gray-700 mb-3">Order Summary</h5>
                      <div className={`rounded-lg p-4 border text-sm ${
                        order.status === 'Cancelled' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                      }`}>
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span className="font-medium">
                            {currency}
                            {subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Delivery Fee:</span>
                          <span className="font-medium">
                            {currency}
                            {(order.deliveryCharges || 0).toFixed(2)}
                          </span>
                        </div>
                        {dealItems.length > 0 && (
                          <div className="flex justify-between text-orange-600 mb-2">
                            <span>Deal Savings:</span>
                            <span className="font-medium">
                              -{currency}
                              {dealItems.reduce((sum, item) => {
                                const originalPrice = getOriginalPrice(item);
                                const discountPrice = getItemPrice(item);
                                const quantity = item.quantity || 1;
                                return sum + ((originalPrice - discountPrice) * quantity);
                              }, 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className={`pt-2 mt-2 border-t flex justify-between font-semibold ${
                          order.status === 'Cancelled' ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'
                        }`}>
                          <span>Total:</span>
                          <span>
                            {currency}
                            {total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h5 className="text-md font-medium text-gray-700 mb-3">Update Status</h5>
                        <select
                          onChange={(e) => statusHandler(e, order._id)}
                          value={order.status}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          disabled={order.status === 'Cancelled'}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Packing">Packing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {order.status === 'Cancelled' && (
                          <p className="text-sm text-red-500 mt-2">
                            This order has been cancelled and cannot be updated.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;