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
  faSpinner,
  faTag,
  faCube,
  faChevronDown,
  faChevronUp,
  faMapMarkerAlt,
  faCreditCard,
  faReceipt,
  faUser,
  faCalendar,
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons';

const Orders = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedDeals, setExpandedDeals] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Define tabs with their configurations
  const tabs = [
    { id: 'all', label: 'All Orders', count: 0, icon: faList, color: 'gray' },
    { id: 'pending', label: 'Pending', count: 0, icon: faClock, color: 'blue' },
    { id: 'packing', label: 'Packing', count: 0, icon: faBox, color: 'amber' },
    { id: 'shipped', label: 'Shipped', count: 0, icon: faShippingFast, color: 'purple' },
    { id: 'out_for_delivery', label: 'Delivery', count: 0, icon: faMotorcycle, color: 'orange' },
    { id: 'delivered', label: 'Delivered', count: 0, icon: faCheckCircle, color: 'green' },
    { id: 'cancelled', label: 'Cancelled', count: 0, icon: faTimesCircle, color: 'red' },
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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.phone?.includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'total_high':
          return (b.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0) - 
                 (a.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0);
        case 'total_low':
          return (a.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0) - 
                 (b.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0);
        default:
          return 0;
      }
    });

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

  // Toggle deal expansion
  const toggleDealExpansion = (orderId, dealName) => {
    const key = `${orderId}-${dealName}`;
    setExpandedDeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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

  // Update filtered orders when orders, search, or sort change
  useEffect(() => {
    if (orders.length > 0) {
      filterOrdersByTab(activeTab, orders);
    }
  }, [orders, searchTerm, sortBy]);

  // Group items by deal
  const groupItemsByDeal = (items) => {
    const dealGroups = {};
    const regularItems = [];
    
    items.forEach(item => {
      if (item.isFromDeal === true) {
        const dealKey = item.dealName || 'Unknown Deal';
        if (!dealGroups[dealKey]) {
          dealGroups[dealKey] = {
            dealName: dealKey,
            dealDescription: item.dealDescription,
            dealImage: item.dealImage,
            items: [],
            totalQuantity: 0,
            totalPrice: 0
          };
        }
        dealGroups[dealKey].items.push(item);
        dealGroups[dealKey].totalQuantity += item.quantity || 1;
        dealGroups[dealKey].totalPrice += (item.price || 0) * (item.quantity || 1);
      } else {
        regularItems.push(item);
      }
    });

    return { dealGroups, regularItems };
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Order Placed':
      case 'Pending':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Packing':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Out for delivery':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'Delivered':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
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

  // Tooltip component
  const Tooltip = ({ children, text }) => (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  // 🌀 Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your orders</p>
        </div>
      </div>
    );
  }

  // If no token and not loading, show message
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <FontAwesomeIcon icon={faReceipt} className="text-gray-500 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Access Required</h3>
          <p className="text-gray-600 mb-6">Please login to view and manage orders</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium w-full sm:w-auto"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const updatedTabs = updateTabCounts(orders);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-3 sm:py-6 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Order Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and track all customer orders in one place
              </p>
            </div>
         
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer name, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex gap-3">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faFilter} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white appearance-none min-w-[160px]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="total_high">Total: High to Low</option>
                    <option value="total_low">Total: Low to High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide px-2 py-2">
            {updatedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 mx-1 rounded-lg ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-700 bg-${tab.color}-50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon 
                  icon={tab.icon} 
                  className={`text-sm mr-3 ${
                    activeTab === tab.id ? `text-${tab.color}-600` : 'text-gray-400'
                  }`} 
                />
                <span className="font-medium">{tab.label}</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full min-w-6 text-center ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-100 text-${tab.color}-700` 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faReceipt} className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchTerm ? 'No orders found' : `No ${activeTab === 'all' ? '' : activeTab.replace('_', ' ')} orders`}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : activeTab !== 'all' 
                  ? `There are no ${activeTab.replace('_', ' ')} orders at the moment.`
                  : 'No orders have been placed yet.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const { dealGroups, regularItems } = groupItemsByDeal(order.items || []);
              const allDeals = Object.values(dealGroups);
              const totalItemsCount = order.items?.length || 0;

              const subtotal = (order.items || []).reduce(
                (sum, item) => sum + ((item.price || 0) * (item.quantity || 1)),
                0
              );
              const total = subtotal + (order.deliveryCharges || 0);

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all duration-200 hover:shadow-md ${
                    order.status === 'Cancelled' ? 'border-red-200' : 'border-gray-200'
                  }`}
                >
                  {/* Order Header */}
                  <div className={`px-4 sm:px-6 py-4 border-b ${
                    order.status === 'Cancelled' ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
                  }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 ${
                          order.status === 'Cancelled' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <FontAwesomeIcon 
                            icon={getStatusIcon(order.status)} 
                            className={`text-lg ${
                              order.status === 'Cancelled' ? 'text-red-600' : 'text-gray-600'
                            }`} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-3">
                              <h4 className={`text-lg font-bold ${
                                order.status === 'Cancelled' ? 'text-red-800' : 'text-gray-900'
                              }`}>
                                #{order._id.substring(0, 8).toUpperCase()}
                              </h4>
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadgeColor(order.status)}`}>
                                <FontAwesomeIcon icon={getStatusIcon(order.status)} className="mr-2" />
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faUser} className="mr-2" />
                                {order.address?.firstName} {order.address?.lastName}
                              </div>
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                                {new Date(order.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {order.cancellationReason && (
                            <p className="text-sm text-red-600 mt-2">
                              <span className="font-medium">Cancellation Reason:</span> {order.cancellationReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{currency}{total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{totalItemsCount} items</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-4 sm:p-6 flex flex-col xl:flex-row gap-6">
                    {/* Items Section */}
                    <div className="xl:flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-gray-900">
                          Order Items
                        </h5>
                        <div className="flex gap-2">
                          {allDeals.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm border border-amber-200 font-medium">
                              <FontAwesomeIcon icon={faTag} className="mr-2" />
                              {allDeals.length} Deal{allDeals.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {regularItems.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm border border-blue-200 font-medium">
                              <FontAwesomeIcon icon={faCube} className="mr-2" />
                              {regularItems.length} Product{regularItems.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto border border-gray-200">
                        {/* Render Deals */}
                        {allDeals.map((deal, dealIndex) => {
                          const isExpanded = expandedDeals[`${order._id}-${deal.dealName}`];
                          
                          return (
                            <div key={dealIndex} className="mb-4 last:mb-0">
                              {/* Deal Header */}
                              <div 
                                className={`flex justify-between items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                  isExpanded ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-gray-200 hover:shadow-sm'
                                }`}
                                onClick={() => toggleDealExpansion(order._id, deal.dealName)}
                              >
                                <div className="flex items-center flex-1 min-w-0">
                                  <span className="bg-amber-500 text-white px-3 py-1.5 rounded text-sm font-semibold mr-4">
                                    <FontAwesomeIcon icon={faTag} className="mr-2" />
                                    Deal
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-base">
                                      {deal.dealName}
                                    </p>
                                    {deal.dealDescription && (
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                        {deal.dealDescription}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 ml-4">
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-base">
                                      {currency}{deal.totalPrice.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {deal.totalQuantity} item{deal.totalQuantity !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <FontAwesomeIcon 
                                    icon={isExpanded ? faChevronUp : faChevronDown} 
                                    className="text-gray-400 text-lg" 
                                  />
                                </div>
                              </div>

                              {/* Deal Items - Collapsible */}
                              {isExpanded && (
                                <div className="mt-3 space-y-2 pl-4">
                                  {deal.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border border-gray-200">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                                          {item.name}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-1">
                                          <span className="text-sm text-gray-500">
                                            Qty: {item.quantity || 1}
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            • {currency}{item.price?.toFixed(2)} each
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-right ml-4">
                                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                          {currency}{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Render Regular Products */}
                        {regularItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-4 px-4 bg-white rounded-lg border border-gray-200 mb-3 last:mb-0 hover:bg-gray-50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-2">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {item.name}
                                </p>
                                <span className="ml-3 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200 font-medium">
                                  Product
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">
                                  Qty: {item.quantity || 1}
                                </span>
                                <span className="text-sm text-gray-500">
                                  • {currency}{item.price?.toFixed(2)} each
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-gray-900 text-base sm:text-lg">
                                {currency}{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Section - Info & Actions */}
                    <div className="flex flex-col gap-6 xl:w-80">
                      {/* Customer & Payment Info */}
                      <div className="space-y-6">
                        {/* Customer Info */}
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                            Customer Information
                          </h5>
                          <div className="bg-gray-50 rounded-xl p-4 text-sm border border-gray-200">
                            <p className="font-semibold text-gray-900 mb-2 text-base">
                              {order.address?.firstName} {order.address?.lastName}
                            </p>
                            <p className="text-gray-600 mb-1">{order.address?.street}</p>
                            <p className="text-gray-600 mb-1">
                              {order.address?.city}, {order.address?.state}
                            </p>
                            <p className="text-gray-600 mb-3">{order.address?.zipcode}</p>
                            <p className="text-gray-600 flex items-center">
                              <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                              {order.address?.phone}
                            </p>
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-400" />
                            Payment Information
                          </h5>
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Status:</span>
                              <span className="font-semibold text-green-600">Paid</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary & Actions */}
                      <div className="space-y-6">
                        {/* Summary */}
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <FontAwesomeIcon icon={faReceipt} className="mr-2 text-gray-400" />
                            Order Summary
                          </h5>
                          <div className={`rounded-xl p-4 border text-sm ${
                            order.status === 'Cancelled' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between mb-3">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-semibold text-gray-900">{currency}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-3">
                              <span className="text-gray-600">Delivery Fee:</span>
                              <span className="font-semibold text-gray-900">
                                {order.deliveryCharges === 0 ? 'FREE' : `${currency}${order.deliveryCharges.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="pt-3 mt-3 border-t border-gray-300 flex justify-between font-semibold text-base">
                              <span className="text-gray-900">Total:</span>
                              <span className="text-gray-900">{currency}{total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Update */}
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h5>
                          <select
                            onChange={(e) => statusHandler(e, order._id)}
                            value={order.status}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white shadow-sm text-sm font-medium"
                            disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packing">Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {(order.status === 'Cancelled' || order.status === 'Delivered') && (
                            <p className="text-sm text-gray-500 mt-2">
                              This order is {order.status.toLowerCase()} and cannot be updated.
                            </p>
                          )}
                        </div>
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