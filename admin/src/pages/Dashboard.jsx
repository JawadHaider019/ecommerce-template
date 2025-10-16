import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { backendUrl } from "../App";
import { 
  faDollarSign, faChartLine, faClipboardList, faClock, faPlus, 
  faBoxes, faShoppingCart, faWarehouse, faChartPie, faTags,
  faArrowTrendUp, faArrowTrendDown, faUsers, faRocket, faPercent,
  faBell, faSync, faExclamationTriangle, faTimes, faFire,
  faUserCheck, faUserPlus, faMapMarkerAlt, faExclamationCircle,
  faMoneyBillWave, faCalculator
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
    totalOrders: 0, totalProductRevenue: 0, totalProducts: 0, pendingOrders: 0, 
    totalProductProfit: 0, profitMargin: 0, totalProductCost: 0, totalItemsSold: 0,
    inventoryValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [customerInsights, setCustomerInsights] = useState({});
  const [alerts, setAlerts] = useState([]);
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
  const [dealData, setDealData] = useState({
    topDeals: [],
    dealPerformance: [],
    dealStats: {
      totalDeals: 0,
      activeDeals: 0,
      totalDealRevenue: 0,
      totalDealCost: 0,
      totalDealProfit: 0,
      dealProfitMargin: 0,
      avgDealDiscount: 0,
      dealsSold: 0,
      dealInventoryValue: 0
    }
  });

  // API Base URL - adjust according to your backend
  const API_BASE = 'http://localhost:4000/api';

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dashboard/stats?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      // Set data from backend - use exact values without any processing
      setStats(data.stats || {});
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
      setLowStockProducts(data.lowStockProducts || []);
      setCustomerInsights(data.customerInsights || {});
      setAlerts(data.alerts || []);
      
      // Set deal data exactly as it comes from API
      if (data.dealData) {
        setDealData({
          topDeals: data.dealData.topDeals || [],
          dealPerformance: data.dealData.dealPerformance || [],
          dealStats: data.dealData.dealStats || {
            totalDeals: 0,
            activeDeals: 0,
            totalDealRevenue: 0,
            totalDealCost: 0,
            totalDealProfit: 0,
            dealProfitMargin: 0,
            avgDealDiscount: 0,
            dealsSold: 0,
            dealInventoryValue: 0
          }
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load all data on component mount and when timeRange changes
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Get display metrics using DIRECT API VALUES ONLY - no calculations
  const getDisplayMetrics = () => {
    const dealStats = dealData.dealStats || {};
    
    return {
      // Product metrics - direct from stats
      productRevenue: stats.totalProductRevenue || 0,
      productCost: stats.totalProductCost || 0,
      productProfit: stats.totalProductProfit || 0,
      productProfitMargin: stats.profitMargin || 0,
      
      // Deal metrics - direct from dealStats
      dealRevenue: dealStats.totalDealRevenue || 0,
      dealCost: dealStats.totalDealCost || 0,
      dealProfit: dealStats.totalDealProfit || 0,
      dealProfitMargin: dealStats.dealProfitMargin || 0,
      
      // Combined metrics - simple addition only
      totalRevenue: (stats.totalProductRevenue || 0) + (dealStats.totalDealRevenue || 0),
      totalCost: (stats.totalProductCost || 0) + (dealStats.totalDealCost || 0),
      totalProfit: (stats.totalProductProfit || 0) + (dealStats.totalDealProfit || 0),
      
      // Other metrics
      totalProductSold: stats.totalItemsSold || 0,
      totalInventoryValue: (stats.inventoryValue || 0) + (dealStats.dealInventoryValue || 0)
    };
  };

  const displayMetrics = getDisplayMetrics();

  // Calculate overall profit margin
  const overallProfitMargin = displayMetrics.totalRevenue > 0 
    ? (displayMetrics.totalProfit / displayMetrics.totalRevenue) * 100 
    : 0;

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Reusable components
  const StatCard = ({ title, value, icon, color, change, subtitle, trend, badge }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            {badge && (
              <span className={`text-xs px-2 py-1 rounded-full ${badge.color} ${badge.textColor}`}>
                {badge.text}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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

  const ProfitBadge = ({ margin }) => (
    <span className={`text-xs px-2 py-1 rounded-full ${
      margin >= 20 ? 'bg-green-100 text-green-800' :
      margin >= 10 ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`}>
      {margin.toFixed(1)}% margin
    </span>
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

  // Chart configurations using actual data - DIRECT API VALUES ONLY
  const chartConfigs = {
    revenue: {
      pie: {
        data: {
          labels: ['Product Revenue', 'Deal Revenue'],
          datasets: [{
            data: [
              Math.max(0, displayMetrics.productRevenue),
              Math.max(0, displayMetrics.dealRevenue)
            ],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)'],
            borderColor: ['rgb(59, 130, 246)', 'rgb(139, 92, 246)'],
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Revenue Breakdown' }
          }
        }
      },
      bar: {
        data: {
          labels: ['Product Revenue', 'Deal Revenue', 'Product Cost', 'Deal Cost', 'Total Profit'],
          datasets: [{
            label: 'Amount (Rs)',
            data: [
              Math.max(0, displayMetrics.productRevenue),
              Math.max(0, displayMetrics.dealRevenue),
              Math.max(0, displayMetrics.productCost),
              Math.max(0, displayMetrics.dealCost),
              Math.max(0, displayMetrics.totalProfit)
            ],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)', 
              'rgba(139, 92, 246, 0.8)', 
              'rgba(239, 68, 68, 0.8)', 
              'rgba(255, 99, 132, 0.8)',
              'rgba(16, 185, 129, 0.8)'
            ],
            borderColor: [
              'rgb(59, 130, 246)', 
              'rgb(139, 92, 246)', 
              'rgb(239, 68, 68)', 
              'rgb(255, 99, 132)',
              'rgb(16, 185, 129)'
            ],
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
    profit: {
      pie: {
        data: {
          labels: ['Product Profit', 'Deal Profit'],
          datasets: [{
            data: [
              Math.max(0, displayMetrics.productProfit),
              Math.max(0, displayMetrics.dealProfit)
            ],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(34, 197, 94, 0.8)'],
            borderColor: ['rgb(16, 185, 129)', 'rgb(34, 197, 94)'],
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Profit Breakdown' }
          }
        }
      },
      bar: {
        data: {
          labels: ['Product Profit', 'Deal Profit'],
          datasets: [{
            label: 'Profit (Rs)',
            data: [
              Math.max(0, displayMetrics.productProfit),
              Math.max(0, displayMetrics.dealProfit)
            ],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(34, 197, 94, 0.8)'],
            borderColor: ['rgb(16, 185, 129)', 'rgb(34, 197, 94)'],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Profit Breakdown' }
          }
        }
      }
    },
    customers: {
      pie: {
        data: {
          labels: ['New Customers', 'Returning Customers'],
          datasets: [{
            data: [
              Math.max(0, customerInsights.newCustomers || 0),
              Math.max(0, customerInsights.repeatBuyers || 0)
            ],
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
            data: [
              Math.max(0, customerInsights.newCustomers || 0),
              Math.max(0, customerInsights.repeatBuyers || 0)
            ],
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
            data: topProducts.map(p => Math.max(0, p.totalSales || 0)),
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
            data: topProducts.map(p => Math.max(0, p.totalSales || 0)),
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
            data: dealData.topDeals.map(d => Math.max(0, d.totalSales || 0)),
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
            data: dealData.topDeals.map(d => Math.max(0, d.totalSales || 0)),
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
    }
  };

  const handleChartToggle = (chartKey, viewType) => {
    setChartViews(prev => ({
      ...prev,
      [chartKey]: viewType
    }));
  };

  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;

  const AlertsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBell} className="text-yellow-500 text-xl" />
            <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadAlertsCount} new</span>
          </div>
          <button onClick={() => setShowAlertsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="divide-y divide-gray-200">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-6 transition-colors ${!alert.read ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
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
                      <h4 className={`font-semibold ${!alert.read ? 'text-blue-900' : 'text-gray-900'}`}>{alert.title}</h4>
                      {!alert.read && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
                    </div>
                    <p className={`text-sm mb-2 ${!alert.read ? 'text-blue-800' : 'text-gray-600'}`}>{alert.message}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={() => setShowAlertsModal(false)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
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
    { to: "/deals", icon: faRocket, text: "Manage Deals", color: "bg-purple-500" }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (amount) => {
    return `Rs ${Math.max(0, amount || 0).toLocaleString()}`;
  };

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
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Revenue & Profit Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(displayMetrics.totalRevenue)} 
            subtitle={`Products: ${formatCurrency(displayMetrics.productRevenue)} | Deals: ${formatCurrency(displayMetrics.dealRevenue)}`}
            icon={faDollarSign} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Total Cost" 
            value={formatCurrency(displayMetrics.totalCost)} 
            subtitle={`Products: ${formatCurrency(displayMetrics.productCost)} | Deals: ${formatCurrency(displayMetrics.dealCost)}`}
            icon={faCalculator} 
            color="bg-red-500" 
          />
          <StatCard 
            title="Total Profit" 
            value={formatCurrency(displayMetrics.totalProfit)} 
            subtitle={`Products: ${formatCurrency(displayMetrics.productProfit)} | Deals: ${formatCurrency(displayMetrics.dealProfit)}`}
            icon={faChartPie} 
            color="bg-blue-500" 
            badge={{
              text: `${overallProfitMargin.toFixed(1)}% margin`,
              color: overallProfitMargin >= 20 ? 'bg-green-100' : overallProfitMargin >= 10 ? 'bg-yellow-100' : 'bg-red-100',
              textColor: overallProfitMargin >= 20 ? 'text-green-800' : overallProfitMargin >= 10 ? 'text-yellow-800' : 'text-red-800'
            }}
          />
        </div>

        {/* Profit Margin Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatCard 
            title="Product Profit Margin" 
            value={`${displayMetrics.productProfitMargin.toFixed(1)}%`} 
            subtitle={`Profit: ${formatCurrency(displayMetrics.productProfit)}`}
            icon={faMoneyBillWave} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Deal Profit Margin" 
            value={`${displayMetrics.dealProfitMargin.toFixed(1)}%`} 
            subtitle={`Profit: ${formatCurrency(displayMetrics.dealProfit)}`}
            icon={faTags} 
            color="bg-purple-500" 
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Deals" 
            value={dealData.dealStats?.activeDeals || 0} 
            icon={faRocket} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Deals Sold" 
            value={dealData.dealStats?.dealsSold || 0} 
            icon={faFire} 
            color="bg-orange-500" 
          />
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts || 0} 
            icon={faBoxes} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="Products Sold" 
            value={displayMetrics.totalProductSold || 0} 
            icon={faShoppingCart} 
            color="bg-blue-500" 
          />
        </div>

        {/* Tertiary Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Inventory Value" 
            value={formatCurrency(displayMetrics.totalInventoryValue)} 
            subtitle={`Products: ${formatCurrency(stats.inventoryValue)} | Deals: ${formatCurrency(dealData.dealStats?.dealInventoryValue)}`}
            icon={faWarehouse} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders || 0} 
            subtitle={`Pending: ${stats.pendingOrders || 0}`}
            icon={faClipboardList} 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders || 0} 
            icon={faClock} 
            color="bg-yellow-500" 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Breakdown Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
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

          {/* Profit Analysis Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Profit Analysis</h3>
              <ChartToggle 
                chartKey="profit" 
                currentView={chartViews.revenue} 
                onToggle={(view) => handleChartToggle('revenue', view)} 
              />
            </div>
            <div className="h-80">
              {chartViews.revenue === 'pie' ? (
                <Doughnut {...chartConfigs.profit.pie} />
              ) : (
                <Bar {...chartConfigs.profit.bar} />
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
              {chartViews.products === 'pie' ? (
                <Pie {...chartConfigs.products.pie} />
              ) : (
                <Bar {...chartConfigs.products.bar} />
              )}
            </div>
          </div>
        </div>

        {/* Deal Performance Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Deal Performance</h3>
            <NavLink to="/deals" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Deals →
            </NavLink>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Deal Performance Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Top Performing Deals</h4>
                <ChartToggle 
                  chartKey="deals" 
                  currentView={chartViews.deals} 
                  onToggle={(view) => handleChartToggle('deals', view)} 
                />
              </div>
              <div className="h-64">
                {chartViews.deals === 'pie' ? (
                  <Pie {...chartConfigs.deals.pie} />
                ) : (
                  <Bar {...chartConfigs.deals.bar} />
                )}
              </div>
            </div>

            {/* Deal Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Deal Discount</p>
                  <p className="text-xl font-bold text-gray-900">{dealData.dealStats?.avgDealDiscount?.toFixed(1) || 0}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Deals</p>
                  <p className="text-xl font-bold text-gray-900">{dealData.dealStats?.totalDeals || 0}</p>
                </div>
              </div>
              
              {/* Active Deals List */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Active Deals</p>
                <div className="space-y-2">
                  {dealData.topDeals
                    .filter(deal => deal.isActive)
                    .slice(0, 3)
                    .map(deal => (
                      <div key={deal._id} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 truncate">{deal.name}</span>
                        <ProfitBadge margin={dealData.dealStats?.dealProfitMargin || 0} />
                      </div>
                    ))
                  }
                  {dealData.topDeals.filter(deal => deal.isActive).length === 0 && (
                    <p className="text-sm text-gray-500">No active deals</p>
                  )}
                </div>
              </div>
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
              {recentOrders.map(order => (
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
              ))}
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
              {lowStockProducts.map((product, index) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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