import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faClock,
  faBox,
  faShippingFast,
  faMotorcycle,
  faCheckCircle,
  faTimesCircle,
  faPhone,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const Orders = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Define tabs with their configurations
  const tabs = [
    { id: 'all', label: 'All Orders', count: 0, icon: faList },
    { id: 'pending', label: 'Pending', count: 0, icon: faClock },
    { id: 'packing', label: 'Packing', count: 0, icon: faBox },
    { id: 'shipped', label: 'Shipped', count: 0, icon: faShippingFast },
    { id: 'out_for_delivery', label: 'Out for Delivery', count: 0, icon: faMotorcycle },
    { id: 'delivered', label: 'Delivered', count: 0, icon: faCheckCircle },
    { id: 'cancelled', label: 'Cancelled', count: 0, icon: faTimesCircle },
  ];

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
        const ordersData = response.data.orders || [];
        setOrders(ordersData);
        filterOrdersByTab(activeTab, ordersData);
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

  // Filter orders based on active tab
  const filterOrdersByTab = (tab, ordersList = orders) => {
    let filtered = [];

    switch (tab) {
      case 'all':
        filtered = ordersList;
        break;
      case 'pending':
        filtered = ordersList.filter(order =>
          order.status === 'Order Placed' ||
          order.status === 'Pending'
        );
        break;
      case 'packing':
        filtered = ordersList.filter(order => order.status === 'Packing');
        break;
      case 'shipped':
        filtered = ordersList.filter(order => order.status === 'Shipped');
        break;
      case 'out_for_delivery':
        filtered = ordersList.filter(order => order.status === 'Out for delivery');
        break;
      case 'delivered':
        filtered = ordersList.filter(order => order.status === 'Delivered');
        break;
      case 'cancelled':
        filtered = ordersList.filter(order => order.status === 'Cancelled');
        break;
      default:
        filtered = ordersList;
    }

    setFilteredOrders(filtered);
  };

  // Update tab counts
  const updateTabCounts = (ordersList) => {
    return tabs.map(tab => {
      let count = 0;
      switch (tab.id) {
        case 'all':
          count = ordersList.length;
          break;
        case 'pending':
          count = ordersList.filter(order =>
            order.status === 'Order Placed' ||
            order.status === 'Pending'
          ).length;
          break;
        case 'packing':
          count = ordersList.filter(order => order.status === 'Packing').length;
          break;
        case 'shipped':
          count = ordersList.filter(order => order.status === 'Shipped').length;
          break;
        case 'out_for_delivery':
          count = ordersList.filter(order => order.status === 'Out for delivery').length;
          break;
        case 'delivered':
          count = ordersList.filter(order => order.status === 'Delivered').length;
          break;
        case 'cancelled':
          count = ordersList.filter(order => order.status === 'Cancelled').length;
          break;
        default:
          count = 0;
      }
      return { ...tab, count };
    });
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    filterOrdersByTab(tabId);
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
        fetchAllOrders(); // Refresh orders to update counts and filters
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

  // Update filtered orders when orders change
  useEffect(() => {
    if (orders.length > 0) {
      filterOrdersByTab(activeTab, orders);
    }
  }, [orders]);

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

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Order Placed':
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'Packing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Out for delivery':
        return 'bg-orange-100 text-orange-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Placed':
      case 'Pending':
        return faClock;
      case 'Packing':
        return faBox;
      case 'Shipped':
        return faShippingFast;
      case 'Out for delivery':
        return faMotorcycle;
      case 'Delivered':
        return faCheckCircle;
      case 'Cancelled':
        return faTimesCircle;
      default:
        return faList;
    }
  };

  // 🌀 Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
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

  const updatedTabs = updateTabCounts(orders);

  // 📋 Render orders
  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 text-left mb-4 sm:mb-0">Order Management</h3>
          <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border">
            Showing <span className="font-semibold">{filteredOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
          </div>
        </div>

        {/* Tabs Navigation - Modern Design */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {updatedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-black text-black bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2 text-sm" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full min-w-6 text-center ${activeTab === tab.id
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <img src={assets.parcel_icon} alt="No orders" className="opacity-50" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {activeTab === 'all' ? 'No orders found' : `No ${activeTab.replace('_', ' ')} orders`}
            </p>
            <p className="text-gray-400 text-sm">
              {activeTab !== 'all' && 'Try selecting a different tab to see more orders.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              // Separate regular items and deal items based on itemType
              const regularItems = order.items?.filter(item => item.itemType !== 'deal') || [];
              const dealItems = order.items?.filter(item => item.itemType === 'deal') || [];
              const allItems = [...regularItems, ...dealItems];

              const subtotal = allItems.reduce(
                (sum, item) => sum + calculateItemTotal(item),
                0
              );
              const total = subtotal + (order.deliveryCharges || 0);

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden border ${order.status === 'Cancelled' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                >
                  {/* Header */}
                  <div className={`px-6 py-4 border-b ${order.status === 'Cancelled' ? 'bg-red-100 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center">
                        <img
                          src={assets.parcel_icon}
                          alt="Order"
                          className="h-8 w-8 mr-3"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-lg font-semibold ${order.status === 'Cancelled' ? 'text-red-800' : 'text-gray-800'
                              }`}>
                              Order #{order._id.substring(0, 7)}
                            </h4>
                          </div>

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

                  <div className="p-6 flex flex-col xl:flex-row gap-6">
                    {/* Items */}
                    <div className="xl:flex-1">
                      <h5 className="text-md font-medium text-gray-700 mb-3">
                        Order Items ({allItems.length})
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
                              className={`flex justify-between items-center py-3 border-b border-gray-300 last:border-0`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="font-medium text-sm text-gray-900">
                                    {getItemName(item)}
                                  </p>
                                  {isDeal ? (
                                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                                      Deal
                                    </span>
                                  ): <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                      Product
                                    </span>}
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
                                        • {product.name} x {product.quantity}
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
                    </div>

                    {/* Middle Section - Address & Summary */}
                    <div className="flex flex-col md:flex-row xl:flex-col gap-6 xl:flex-1">
                      {/* Address */}
                      <div>
                        <h5 className="text-md font-medium text-gray-700 mb-3">Delivery Address</h5>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="font-medium">
                            {order.address?.firstName} {order.address?.lastName}
                          </p>
                          <p>{order.address?.street}</p>
                          <p>
                            {order.address?.city}, {order.address?.state}
                          </p>
                          <p>{order.address?.zipcode}</p>
                          <p className="mt-1">
                            <FontAwesomeIcon icon={faPhone} className="mr-1 text-xs text-green-700" />
                            {order.address?.phone}
                          </p>
                        </div>
                      </div>
                      <div >
                        <h5 className="text-md font-medium text-gray-700 mb-3">
                          Payment Information
                        </h5>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-md font-medium">
                          <div className="flex justify-between">
                            <span>Method:</span>
                            <span className="font-medium capitalize">{order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Section - Payment & Status */}
                    <div className="flex flex-col md:flex-row xl:flex-col gap-6 xl:flex-1">

                      {/* Summary */}
                      <div>
                        <h5 className="text-md font-medium text-gray-700 mb-3">Order Summary</h5>
                        <div className={`rounded-lg p-4 border text-sm ${order.status === 'Cancelled' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                          }`}>
                          <div className="flex justify-between mb-3">
                            <span>Subtotal:</span>
                            <span className="font-medium">
                              {currency}
                              {subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between mb-3">
                            <span>Delivery Fee:</span>
                            <span className="font-medium">
                              {currency}
                              {(order.deliveryCharges || 0).toFixed(2)}
                            </span>
                          </div>

                          <div className={`pt-2 mt-2 border-t flex justify-between font-semibold ${order.status === 'Cancelled' ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'
                            }`}>
                            <span>Total:</span>
                            <span>
                              {currency}
                              {total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-md font-medium text-gray-700 mb-3">Update Status</h5>
                        <select
                          onChange={(e) => statusHandler(e, order._id)}
                          value={order.status}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white shadow-sm"
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