import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, faChartLine, faClipboardList, faClock, faPlus, 
  faBoxes, faShoppingCart, faWarehouse, faChartPie, faTags,
  faArrowTrendUp, faArrowTrendDown, faUsers, faRocket, faPercent,
  faBell, faSync, faExclamationTriangle, faTimes, faFire,
  faUserCheck, faUserPlus, faMapMarkerAlt, faExclamationCircle,
  faComments, faStar, faReply
} from '@fortawesome/free-solid-svg-icons';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    totalOrders: 0, 
    totalProductRevenue: 0, 
    totalProducts: 0, 
    pendingOrders: 0, 
    totalProductProfit: 0, 
    profitMargin: 0, 
    totalProductCost: 0, 
    totalItemsSold: 0,
    inventoryValue: 0,
    // Deal stats
    totalDeals: 0,
    activeDeals: 0,
    totalDealRevenue: 0,
    totalDealCost: 0,
    totalDealProfit: 0,
    dealProfitMargin: 0,
    avgDealDiscount: 0,
    dealsSold: 0,
    dealInventoryValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [customerInsights, setCustomerInsights] = useState({});
  const [dealData, setDealData] = useState({
    topDeals: [],
    dealPerformance: [],
    dealStats: {}
  });
  const [alerts, setAlerts] = useState([]);
  const [commentNotifications, setCommentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [chartViews, setChartViews] = useState({
    revenue: 'pie',
    customers: 'pie',
    products: 'pie',
    deals: 'pie'
  });
  const [revenueTimeRange, setRevenueTimeRange] = useState('12months');
  const [profitTimeRange, setProfitTimeRange] = useState('12months');
  const [salesTrend, setSalesTrend] = useState([]);
  const [profitTrend, setProfitTrend] = useState([]);

  // API base URL
  const API_BASE = 'http://localhost:4000/api';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dashboard/stats?timeRange=${timeRange}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
        setLowStockProducts(data.lowStockProducts || []);
        setCustomerInsights(data.customerInsights || {});
        setDealData(data.dealData || { topDeals: [], dealPerformance: [], dealStats: {} });
        setAlerts(data.alerts || []);
      } else {
        console.error('Error fetching dashboard data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comment notifications
  const fetchCommentNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/comments/notifications`);
      const data = await response.json();
      
      if (response.ok) {
        setCommentNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching comment notifications:', error);
    }
  };

  // Fetch sales trend data for revenue chart
  const fetchSalesTrend = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/sales-trend?period=${revenueTimeRange}`);
      const data = await response.json();
      
      if (response.ok) {
        setSalesTrend(data.trend || []);
      }
    } catch (error) {
      console.error('Error fetching sales trend:', error);
    }
  };

  // Fetch profit trend data for profit growth chart
  const fetchProfitTrend = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/sales-trend?period=${profitTimeRange}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfitTrend(data.trend || []);
      }
    } catch (error) {
      console.error('Error fetching profit trend:', error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/alerts`);
      const data = await response.json();
      
      if (response.ok) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Mark comment as read
  const handleCommentRead = async (commentId) => {
    try {
      await fetch(`${API_BASE}/comments/${commentId}/read`, {
        method: 'PATCH'
      });
      // Refresh notifications
      fetchCommentNotifications();
    } catch (error) {
      console.error('Error marking comment as read:', error);
    }
  };

  // Load data on component mount and when timeRange changes
  useEffect(() => {
    fetchDashboardData();
    fetchCommentNotifications();
  }, [timeRange]);

  // Fetch revenue trend when revenueTimeRange changes
  useEffect(() => {
    fetchSalesTrend();
  }, [revenueTimeRange]);

  // Fetch profit trend when profitTimeRange changes
  useEffect(() => {
    fetchProfitTrend();
  }, [profitTimeRange]);

  // Refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(), 
      fetchSalesTrend(), 
      fetchProfitTrend(),
      fetchAlerts(),
      fetchCommentNotifications()
    ]);
    setRefreshing(false);
  };

  // Calculate combined metrics from actual data
  const calculateCombinedMetrics = () => {
    const productRevenue = stats.totalProductRevenue || 0;
    const dealRevenue = stats.totalDealRevenue || 0;
    const totalRevenue = productRevenue + dealRevenue;
    
    const productCost = stats.totalProductCost || 0;
    const dealCost = stats.totalDealCost || 0;
    const totalCost = productCost + dealCost;
    
    const productProfit = stats.totalProductProfit || 0;
    const dealProfit = stats.totalDealProfit || 0;
    const totalProfit = productProfit + dealProfit;

    return {
      productRevenue,
      productCost,
      productProfit,
      dealRevenue,
      dealCost,
      dealProfit,
      totalRevenue,
      totalCost,
      totalProfit,
      totalProductSold: stats.totalItemsSold - (stats.dealsSold || 0),
      totalInventoryValue: (stats.inventoryValue || 0) + (stats.dealInventoryValue || 0)
    };
  };

  const combinedMetrics = calculateCombinedMetrics();

  // Calculate total notifications count
  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;
  const unreadCommentsCount = commentNotifications.length;
  const totalNotificationsCount = unreadAlertsCount + unreadCommentsCount;

  // Reusable components
  const StatCard = ({ title, value, icon, color, change, subtitle, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' && value >= 1000 ? `Rs ${value.toLocaleString()}` : value}
          </p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <div className="flex items-center mt-2">
              <FontAwesomeIcon 
                icon={change > 0 ? faArrowTrendUp : faArrowTrendDown} 
                className={`text-xs mr-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`} 
              />
              <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}%
              </p>
            </div>
          )}
          {trend && <div className="flex items-center mt-1"><span className="text-xs text-gray-500">{trend}</span></div>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-md`}>
          <FontAwesomeIcon icon={icon} className="text-xl text-white" />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = { 
      Delivered: 'bg-green-100 text-green-800', 
      Processing: 'bg-blue-100 text-blue-800', 
      Shipped: 'bg-yellow-100 text-yellow-800',
      'Order Placed': 'bg-purple-100 text-purple-800',
      Packing: 'bg-orange-100 text-orange-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const StockBadge = ({ stock }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      stock <= 2 ? 'bg-red-100 text-red-800' : 
      stock <= 5 ? 'bg-yellow-100 text-yellow-800' : 
      'bg-green-100 text-green-800'
    }`}>
      {stock} left
    </span>
  );

  const ChartToggle = ({ chartKey, currentView, onToggle }) => (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onToggle('pie')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
          currentView === 'pie' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
        }`}
      >
        Pie
      </button>
      <button
        onClick={() => onToggle('bar')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
          currentView === 'bar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
        }`}
      >
        Bar
      </button>
    </div>
  );

  // Chart configurations using real data
  const chartConfigs = {
    revenue: {
      pie: {
        data: {
          labels: ['Product Revenue', 'Deal Revenue', 'Total Profit'],
          datasets: [{
            data: [combinedMetrics.productRevenue, combinedMetrics.dealRevenue, combinedMetrics.totalProfit],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
            borderColor: ['rgb(59, 130, 246)', 'rgb(139, 92, 246)', 'rgb(16, 185, 129)'],
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Revenue & Profit Breakdown' }
          }
        }
      },
      bar: {
        data: {
          labels: ['Product Revenue', 'Deal Revenue', 'Total Cost', 'Total Profit'],
          datasets: [{
            label: 'Amount (Rs)',
            data: [combinedMetrics.productRevenue, combinedMetrics.dealRevenue, combinedMetrics.totalCost, combinedMetrics.totalProfit],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(16, 185, 129, 0.8)'],
            borderColor: ['rgb(59, 130, 246)', 'rgb(139, 92, 246)', 'rgb(239, 68, 68)', 'rgb(16, 185, 129)'],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Revenue & Cost Analysis' }
          }
        }
      }
    },
    customers: {
      pie: {
        data: {
          labels: ['New Customers', 'Returning Customers'],
          datasets: [{
            data: [customerInsights.newCustomers || 0, customerInsights.repeatBuyers || 0],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
            borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Customer Distribution' }
          }
        }
      },
      bar: {
        data: {
          labels: ['New Customers', 'Returning Customers'],
          datasets: [{
            label: 'Count',
            data: [customerInsights.newCustomers || 0, customerInsights.repeatBuyers || 0],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
            borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Customer Distribution' }
          }
        }
      }
    },
    products: {
      pie: {
        data: {
          labels: topProducts.map(p => p.name),
          datasets: [{
            data: topProducts.map(p => p.totalSales || 0),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)', 
              'rgba(16, 185, 129, 0.8)', 
              'rgba(139, 92, 246, 0.8)', 
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(156, 163, 175, 0.8)'
            ],
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Top Selling Products' }
          }
        }
      },
      bar: {
        data: {
          labels: topProducts.map(p => p.name),
          datasets: [{
            label: 'Units Sold',
            data: topProducts.map(p => p.totalSales || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top Selling Products' }
          }
        }
      }
    },
    deals: {
      pie: {
        data: {
          labels: dealData.topDeals.map(d => d.name),
          datasets: [{
            data: dealData.topDeals.map(d => d.totalSales || 0),
            backgroundColor: [
              'rgba(139, 92, 246, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)'
            ],
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Top Performing Deals' }
          }
        }
      },
      bar: {
        data: {
          labels: dealData.topDeals.map(d => d.name),
          datasets: [{
            label: 'Units Sold',
            data: dealData.topDeals.map(d => d.totalSales || 0),
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top Performing Deals' }
          }
        }
      }
    },
    revenueTrend: {
      data: {
        labels: salesTrend.map(item => item.period),
        datasets: [
          {
            label: 'Revenue',
            data: salesTrend.map(item => item.revenue),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Profit',
            data: salesTrend.map(item => item.profit),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Revenue & Profit Trend' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'Rs ' + value.toLocaleString();
              }
            }
          }
        }
      }
    },
    profitGrowth: {
      data: {
        labels: profitTrend.map(item => item.period),
        datasets: [{
          label: 'Profit (Rs)',
          data: profitTrend.map(item => item.profit),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Monthly Profit Growth' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'Rs ' + value.toLocaleString();
              }
            }
          }
        }
      }
    }
  };

  const handleChartToggle = (chartKey, viewType) => {
    setChartViews(prev => ({
      ...prev,
      [chartKey]: viewType
    }));
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const AlertsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBell} className="text-yellow-500 text-xl" />
            <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {totalNotificationsCount} new
            </span>
          </div>
          <button onClick={() => setShowAlertsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh]">
          {/* Comment Notifications Section */}
          {commentNotifications.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faComments} />
                  New Reviews & Comments ({commentNotifications.length})
                </h4>
              </div>
              <div className="divide-y divide-gray-200">
                {commentNotifications.map(comment => (
                  <div 
                    key={comment._id} 
                    className="p-6 bg-blue-50 transition-colors cursor-pointer hover:bg-blue-100"
                    onClick={() => handleCommentRead(comment._id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faComments} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">
                            New {comment.rating ? 'Review' : 'Comment'}
                          </h4>
                          <div className="flex items-center gap-2">
                            {comment.rating && (
                              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                                <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xs" />
                                <span className="text-xs font-medium text-yellow-800">{comment.rating}</span>
                              </div>
                            )}
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                          </div>
                        </div>
                        <p className="text-sm text-blue-800 mb-1">
                          <strong>{comment.author}</strong> on <strong>{comment.productId?.name || 'Product'}</strong>
                        </p>
                        <p className="text-sm text-blue-700 mb-2 line-clamp-2">{comment.content}</p>
                        <p className="text-xs text-blue-600">
                          {new Date(comment.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Alerts Section */}
          {alerts.length > 0 && (
            <div>
              <div className="p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  System Alerts ({unreadAlertsCount})
                </h4>
              </div>
              <div className="divide-y divide-gray-200">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-6 transition-colors ${!alert.read ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={faExclamationTriangle} 
                          className={alert.priority === 'high' ? 'text-red-600' : 'text-yellow-600'} 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold ${!alert.read ? 'text-yellow-900' : 'text-gray-900'}`}>
                            {alert.title}
                          </h4>
                          {!alert.read && <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
                        </div>
                        <p className={`text-sm mb-2 ${!alert.read ? 'text-yellow-800' : 'text-gray-600'}`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {commentNotifications.length === 0 && alerts.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faBell} className="text-gray-300 text-4xl mb-4" />
              <p className="text-gray-500">No new notifications</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button 
            onClick={() => setShowAlertsModal(false)} 
            className="flex-1 bg-black text-white py-3"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </div>
  );

  const quickActions = [
    { to: "/add", icon: faPlus, text: "Add Product", color: "bg-blue-500" },
    { to: "/list", icon: faBoxes, text: "Manage Products", color: "bg-green-500" },
    { to: "/orders", icon: faShoppingCart, text: "View Orders", color: "bg-red-500" },
    { to: "/deals", icon: faRocket, text: "Manage Deals", color: "bg-purple-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map(range => (
                <button 
                  key={range} 
                  onClick={() => handleTimeRangeChange(range)} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    timeRange === range ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <FontAwesomeIcon 
                icon={faSync} 
                className={`text-xl ${refreshing ? 'animate-spin' : ''}`} 
              />
            </button>
            <button 
              onClick={() => setShowAlertsModal(true)} 
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              {totalNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {totalNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`Rs ${combinedMetrics.totalRevenue?.toLocaleString()}`} 
            subtitle={`Products: Rs ${combinedMetrics.productRevenue?.toLocaleString()} | Deals: Rs ${combinedMetrics.dealRevenue?.toLocaleString()}`}
            icon={faDollarSign} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Total Cost" 
            value={`Rs ${combinedMetrics.totalCost?.toLocaleString()}`} 
            subtitle={`Products: Rs ${combinedMetrics.productCost?.toLocaleString()} | Deals: Rs ${combinedMetrics.dealCost?.toLocaleString()}`}
            icon={faChartLine} 
            color="bg-red-500" 
          />
          <StatCard 
            title="Total Profit" 
            value={`Rs ${combinedMetrics.totalProfit?.toLocaleString()}`} 
            subtitle={`Products: Rs ${combinedMetrics.productProfit?.toLocaleString()} | Deals: Rs ${combinedMetrics.dealProfit?.toLocaleString()}`}
            icon={faChartPie} 
            color="bg-blue-500" 
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Deals" 
            value={stats.activeDeals} 
            icon={faRocket} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Deals Sold" 
            value={stats.dealsSold} 
            icon={faFire} 
            color="bg-orange-500" 
          />
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon={faBoxes} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="New Comments" 
            value={commentNotifications.length} 
            icon={faComments} 
            color="bg-blue-500" 
          />
        </div>

        {/* Tertiary Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Inventory Value" 
            value={`Rs ${combinedMetrics.totalInventoryValue?.toLocaleString()}`} 
            subtitle={`Products: Rs ${stats.inventoryValue?.toLocaleString()} | Deals: Rs ${stats.dealInventoryValue?.toLocaleString()}`}
            icon={faWarehouse} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            subtitle={`Pending: ${stats.pendingOrders}`}
            icon={faClipboardList} 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders} 
            icon={faClock} 
            color="bg-yellow-500" 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue & Profit Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue & Profit</h3>
              <ChartToggle 
                chartKey="revenue" 
                currentView={chartViews.revenue} 
                onToggle={(view) => handleChartToggle('revenue', view)} 
              />
            </div>
            <div className="h-80">
              {chartViews.revenue === 'pie' ? (
                <Doughnut {...chartConfigs.revenue.pie} />
              ) : (
                <Bar {...chartConfigs.revenue.bar} />
              )}
            </div>
          </div>

          {/* Customer Distribution Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
              <ChartToggle 
                chartKey="customers" 
                currentView={chartViews.customers} 
                onToggle={(view) => handleChartToggle('customers', view)} 
              />
            </div>
            <div className="h-80">
              {chartViews.customers === 'pie' ? (
                <Pie {...chartConfigs.customers.pie} />
              ) : (
                <Bar {...chartConfigs.customers.bar} />
              )}
            </div>
          </div>

          {/* Product Sales Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
              <ChartToggle 
                chartKey="products" 
                currentView={chartViews.products} 
                onToggle={(view) => handleChartToggle('products', view)} 
              />
            </div>
            <div className="h-80">
              {topProducts.length > 0 ? (
                chartViews.products === 'pie' ? (
                  <Pie {...chartConfigs.products.pie} />
                ) : (
                  <Bar {...chartConfigs.products.bar} />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No product data available
                </div>
              )}
            </div>
          </div>

          {/* Deal Performance Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Deals</h3>
              <ChartToggle 
                chartKey="deals" 
                currentView={chartViews.deals} 
                onToggle={(view) => handleChartToggle('deals', view)} 
              />
            </div>
            <div className="h-80">
              {dealData.topDeals.length > 0 ? (
                chartViews.deals === 'pie' ? (
                  <Pie {...chartConfigs.deals.pie} />
                ) : (
                  <Bar {...chartConfigs.deals.bar} />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No deal data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders & Low Stock - Parallel Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <NavLink to="/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all →
              </NavLink>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">#{order._id}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs mr-1" />
                          <span>{order.user?.location || 'Unknown'}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Rs {order.amount}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
              <NavLink to="/list" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage Inventory →
              </NavLink>
            </div>
            <div className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category} • Ideal: {product.idealStock}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StockBadge stock={product.quantity} />
                      <p className="text-sm text-gray-600 mt-1">Value: Rs {(product.quantity * product.cost).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  All products are well stocked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['3months', '6months', '12months'].map(range => (
                <button
                  key={range}
                  onClick={() => setRevenueTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    revenueTimeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : '12 Months'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            {salesTrend.length > 0 ? (
              <Line {...chartConfigs.revenueTrend} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>

        {/* Profit Growth Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Profit Growth</h3>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['3months', '6months', '12months'].map(range => (
                <button
                  key={range}
                  onClick={() => setProfitTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    profitTimeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : '12 Months'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            {profitTrend.length > 0 ? (
              <Bar {...chartConfigs.profitGrowth} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No profit data available
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, i) => (
              <NavLink 
                key={i} 
                to={action.to} 
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 transition-all hover:bg-gray-100 hover:shadow-md"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <FontAwesomeIcon icon={action.icon} className="text-white" />
                </div>
                <span className="font-medium text-gray-900">{action.text}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Notifications Modal */}
        {showAlertsModal && <AlertsModal />}
      </div>
    </div>
  );
};

export default Dashboard;