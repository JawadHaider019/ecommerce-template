import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, faChartLine, faClipboardList, faClock, faPlus, 
  faBoxes, faShoppingCart, faWarehouse, faChartPie, faTags,
  faArrowTrendUp, faArrowTrendDown, faUsers, faRocket, faPercent,
  faBell, faSync, faExclamationTriangle, faTimes, faFire,
  faUserCheck, faUserPlus, faMapMarkerAlt, faExclamationCircle
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
    totalOrders: 0, totalRevenue: 0, totalProducts: 0, pendingOrders: 0, 
    totalProfit: 0, profitMargin: 0, totalCost: 0, totalItemsSold: 0,
    inventoryValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [customerInsights, setCustomerInsights] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Complete dummy data
  const dummyStats = {
    totalOrders: 189,
    totalRevenue: 158300,
    totalProducts: 47,
    pendingOrders: 18,
    totalProfit: 63200,
    profitMargin: 40,
    totalCost: 95100,
    totalItemsSold: 345,
    inventoryValue: 52300
  };

  const dummyTopProducts = [
    { _id: '1', name: 'Neem Soap', category: 'Skincare', price: 120, cost: 72, quantity: 15, totalSales: 67 },
    { _id: '2', name: 'Aloe Vera Facewash', category: 'Skincare', price: 120, cost: 72, quantity: 2, totalSales: 54 },
    { _id: '3', name: 'Charcoal Soap', category: 'Skincare', price: 150, cost: 90, quantity: 8, totalSales: 48 },
    { _id: '4', name: 'Rose Toner', category: 'Skincare', price: 200, cost: 120, quantity: 12, totalSales: 42 },
    { _id: '5', name: 'Lavender Oil', category: 'Essential Oils', price: 300, cost: 180, quantity: 20, totalSales: 38 },
    { _id: '6', name: 'Tea Tree Oil', category: 'Essential Oils', price: 280, cost: 168, quantity: 1, totalSales: 32 }
  ];

  const dummyRecentOrders = [
    { 
      _id: '#ORD-001', 
      user: { name: 'John Doe', location: 'New York' }, 
      amount: 1200, 
      status: 'Delivered', 
      createdAt: '2024-01-15',
      items: [{ name: 'Neem Soap', quantity: 2 }, { name: 'Aloe Vera Facewash', quantity: 1 }]
    },
    { 
      _id: '#ORD-002', 
      user: { name: 'Jane Smith', location: 'Los Angeles' }, 
      amount: 850, 
      status: 'Processing', 
      createdAt: '2024-01-15',
      items: [{ name: 'Charcoal Soap', quantity: 1 }]
    },
    { 
      _id: '#ORD-003', 
      user: { name: 'Mike Johnson', location: 'Chicago' }, 
      amount: 2100, 
      status: 'Shipped', 
      createdAt: '2024-01-14',
      items: [{ name: 'Rose Toner', quantity: 1 }, { name: 'Lavender Oil', quantity: 1 }]
    },
    { 
      _id: '#ORD-004', 
      user: { name: 'Sarah Wilson', location: 'Miami' }, 
      amount: 950, 
      status: 'Delivered', 
      createdAt: '2024-01-14',
      items: [{ name: 'Summer Skincare Bundle', quantity: 1 }]
    },
    { 
      _id: '#ORD-005', 
      user: { name: 'David Brown', location: 'Seattle' }, 
      amount: 1800, 
      status: 'Processing', 
      createdAt: '2024-01-13',
      items: [{ name: 'Winter Special Offer', quantity: 1 }]
    },
    { 
      _id: '#ORD-006', 
      user: { name: 'Emily Davis', location: 'Boston' }, 
      amount: 3200, 
      status: 'Delivered', 
      createdAt: '2024-01-13',
      items: [{ name: 'Clearance Sale Bundle', quantity: 2 }]
    }
  ];

  const dummyLowStockProducts = [
    { _id: '2', name: 'Aloe Vera Facewash', quantity: 2, cost: 72, idealStock: 20, category: 'Skincare' },
    { _id: '6', name: 'Tea Tree Oil', quantity: 1, cost: 168, idealStock: 12, category: 'Essential Oils' },
    { _id: '7', name: 'Jasmine Lotion', quantity: 3, cost: 200, idealStock: 18, category: 'Body Care' },
    { _id: '8', name: 'Vitamin C Serum', quantity: 4, cost: 350, idealStock: 15, category: 'Skincare' },
    { _id: '9', name: 'Sunscreen SPF 50', quantity: 2, cost: 280, idealStock: 25, category: 'Skincare' }
  ];

  const dummyCustomerInsights = {
    totalCustomers: 189,
    repeatBuyers: 124,
    repeatRate: 65.6,
    newCustomers: 65,
    topCustomers: [
      { name: 'Sarah Wilson', totalSpent: 12500, orders: 8 },
      { name: 'Mike Johnson', totalSpent: 9800, orders: 6 },
      { name: 'Emily Davis', totalSpent: 8700, orders: 5 }
    ]
  };

  const dummyDealData = {
    topDeals: [
      { 
        _id: '1', 
        name: 'Summer Skincare Bundle', 
        type: 'bundle', 
        discountType: 'percentage', 
        discountValue: 25, 
        status: 'published', 
        views: 150, 
        clicks: 45, 
        revenue: 12500,
        totalSales: 45,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      },
      { 
        _id: '2', 
        name: 'Winter Special Offer', 
        type: 'discount', 
        discountType: 'fixed', 
        discountValue: 100, 
        status: 'published', 
        views: 120, 
        clicks: 28, 
        revenue: 8900,
        totalSales: 32,
        startDate: '2024-01-15',
        endDate: '2024-02-15'
      },
      { 
        _id: '3', 
        name: 'Clearance Sale', 
        type: 'flash_sale', 
        discountType: 'percentage', 
        discountValue: 40, 
        status: 'published', 
        views: 200, 
        clicks: 65, 
        revenue: 18200,
        totalSales: 28,
        startDate: '2024-01-10',
        endDate: '2024-01-20'
      },
      { 
        _id: '4', 
        name: 'Festival Discount', 
        type: 'seasonal', 
        discountType: 'percentage', 
        discountValue: 15, 
        status: 'published', 
        views: 180, 
        clicks: 42, 
        revenue: 7500,
        totalSales: 18,
        startDate: '2024-01-05',
        endDate: '2024-01-25'
      }
    ],
    dealPerformance: [
      { type: 'bundle', count: 3, totalViews: 320, totalClicks: 85, totalRevenue: 28900, avgDiscount: 25 },
      { type: 'discount', count: 2, totalViews: 180, totalClicks: 42, totalRevenue: 15600, avgDiscount: 15 },
      { type: 'flash_sale', count: 1, totalViews: 200, totalClicks: 65, totalRevenue: 18200, avgDiscount: 40 },
      { type: 'seasonal', count: 1, totalViews: 180, totalClicks: 42, totalRevenue: 7500, avgDiscount: 15 }
    ],
    dealStats: {
      totalDeals: 6,
      activeDeals: 4,
      totalDealRevenue: 70200,
      avgDealDiscount: 26.7,
      dealsSold: 123,
      dealInventoryValue: 7800
    }
  };

  const dummyAlerts = [
    {
      id: 1,
      type: 'stock',
      title: 'Critical Stock Alert',
      message: 'Tea Tree Oil is running very low (1 left)',
      priority: 'high',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'order',
      title: 'New High Value Order',
      message: 'New order #ORD-006 received from Emily Davis - Rs 3,200',
      priority: 'medium',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'deal',
      title: 'Deal Performance',
      message: 'Clearance Sale has generated Rs 18,200 in revenue',
      priority: 'low',
      timestamp: new Date().toISOString(),
      read: false
    }
  ];

  // Calculate combined metrics
  const calculateCombinedMetrics = () => {
    const productRevenue = dummyStats.totalRevenue - dummyDealData.dealStats.totalDealRevenue;
    const productCost = dummyStats.totalCost * (productRevenue / dummyStats.totalRevenue) || 0;
    const productProfit = productRevenue - productCost;
    
    const dealCost = dummyStats.totalCost - productCost;
    const dealProfit = dummyDealData.dealStats.totalDealRevenue - dealCost;

    return {
      productRevenue,
      productCost,
      productProfit,
      dealCost,
      dealProfit,
      totalProductSold: dummyStats.totalItemsSold - dummyDealData.dealStats.dealsSold,
      totalInventoryValue: dummyStats.inventoryValue + (dummyDealData.dealStats.dealInventoryValue || 0)
    };
  };

  const combinedMetrics = calculateCombinedMetrics();

  // Load all dummy data on component mount
  useEffect(() => {
    setStats(dummyStats);
    setRecentOrders(dummyRecentOrders);
    setTopProducts(dummyTopProducts);
    setLowStockProducts(dummyLowStockProducts.sort((a, b) => a.quantity - b.quantity));
    setCustomerInsights(dummyCustomerInsights);
    setAlerts(dummyAlerts);

    // Auto-open notifications
    setTimeout(() => setShowAlertsModal(true), 2000);
  }, []);

  // Reusable components
  const StatCard = ({ title, value, icon, color, change, subtitle, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
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

  const StatusBadge = ({ status }) => {
    const colors = { 
      Delivered: 'bg-green-100 text-green-800', 
      Processing: 'bg-blue-100 text-blue-800', 
      Shipped: 'bg-yellow-100 text-yellow-800' 
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

  // Revenue trend data for different time ranges
  const revenueTrendData = {
    '3months': {
      labels: ['Oct', 'Nov', 'Dec'],
      revenue: [45000, 52000, 158300],
      profit: [18000, 20800, 63200]
    },
    '6months': {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      revenue: [32000, 38000, 42000, 45000, 52000, 158300],
      profit: [12800, 15200, 16800, 18000, 20800, 63200]
    },
    '12months': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      revenue: [28000, 32000, 35000, 38000, 42000, 45000, 32000, 38000, 42000, 45000, 52000, 158300],
      profit: [11200, 12800, 14000, 15200, 16800, 18000, 12800, 15200, 16800, 18000, 20800, 63200]
    }
  };

  // Profit growth data for different time ranges
  const profitGrowthData = {
    '3months': {
      labels: ['Oct', 'Nov', 'Dec'],
      profit: [18000, 20800, 63200]
    },
    '6months': {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      profit: [12800, 15200, 16800, 18000, 20800, 63200]
    },
    '12months': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      profit: [9800, 11200, 12800, 14000, 15200, 16800, 12800, 15200, 16800, 18000, 20800, 63200]
    }
  };

  // Chart configurations
  const chartConfigs = {
    revenue: {
      pie: {
        data: {
          labels: ['Product Revenue', 'Deal Revenue', 'Total Profit'],
          datasets: [{
            data: [combinedMetrics.productRevenue, dummyDealData.dealStats.totalDealRevenue, dummyStats.totalProfit],
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
            data: [combinedMetrics.productRevenue, dummyDealData.dealStats.totalDealRevenue, dummyStats.totalCost, dummyStats.totalProfit],
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
            data: [dummyCustomerInsights.newCustomers, dummyCustomerInsights.repeatBuyers],
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
            data: [dummyCustomerInsights.newCustomers, dummyCustomerInsights.repeatBuyers],
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
          labels: dummyTopProducts.map(p => p.name),
          datasets: [{
            data: dummyTopProducts.map(p => p.totalSales),
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
          labels: dummyTopProducts.map(p => p.name),
          datasets: [{
            label: 'Units Sold',
            data: dummyTopProducts.map(p => p.totalSales),
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
          labels: dummyDealData.topDeals.map(d => d.name),
          datasets: [{
            data: dummyDealData.topDeals.map(d => d.totalSales),
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
          labels: dummyDealData.topDeals.map(d => d.name),
          datasets: [{
            label: 'Units Sold',
            data: dummyDealData.topDeals.map(d => d.totalSales),
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
        labels: revenueTrendData[revenueTimeRange].labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueTrendData[revenueTimeRange].revenue,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Profit',
            data: revenueTrendData[revenueTimeRange].profit,
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
        labels: profitGrowthData[profitTimeRange].labels,
        datasets: [{
          label: 'Profit (Rs)',
          data: profitGrowthData[profitTimeRange].profit,
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

  const unreadAlertsCount = dummyAlerts.filter(alert => !alert.read).length;

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
            {dummyAlerts.map(alert => (
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
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FontAwesomeIcon icon={faSync} className="text-xl" />
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

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`Rs ${dummyStats.totalRevenue?.toLocaleString()}`} 
            subtitle={`Products: Rs ${combinedMetrics.productRevenue?.toLocaleString()} | Deals: Rs ${dummyDealData.dealStats.totalDealRevenue?.toLocaleString()}`}
            icon={faDollarSign} 
            color="bg-green-500" 
            change={12} 
          />
          <StatCard 
            title="Total Cost" 
            value={`Rs ${dummyStats.totalCost?.toLocaleString()}`} 
            subtitle={`Products: Rs ${combinedMetrics.productCost?.toLocaleString()} | Deals: Rs ${combinedMetrics.dealCost?.toLocaleString()}`}
            icon={faChartLine} 
            color="bg-red-500" 
          />
          <StatCard 
            title="Total Profit" 
            value={`Rs ${dummyStats.totalProfit?.toLocaleString()}`} 
            subtitle={`Products: Rs ${combinedMetrics.productProfit?.toLocaleString()} | Deals: Rs ${combinedMetrics.dealProfit?.toLocaleString()}`}
            icon={faChartPie} 
            color="bg-blue-500" 
            change={15} 
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Deals" 
            value={dummyDealData.dealStats.activeDeals} 
            icon={faRocket} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Deals Sold" 
            value={dummyDealData.dealStats.dealsSold} 
            icon={faFire} 
            color="bg-orange-500" 
          />
           <StatCard 
            title="Total Products" 
            value={dummyStats.totalProducts} 
            icon={faBoxes} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="Products Sold" 
            value={combinedMetrics.totalProductSold} 
            icon={faBoxes} 
            color="bg-indigo-500" 
          />
         
        </div>

        {/* Tertiary Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           <StatCard 
            title="Inventory Value" 
            value={`Rs ${combinedMetrics.totalInventoryValue?.toLocaleString()}`} 
            subtitle={`Products: Rs ${dummyStats.inventoryValue?.toLocaleString()} | Deals: Rs ${dummyDealData.dealStats.dealInventoryValue?.toLocaleString()}`}
            icon={faWarehouse} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Total Orders" 
            value={dummyStats.totalOrders} 
            subtitle={`Pending: ${dummyStats.pendingOrders}`}
            icon={faClipboardList} 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Pending Orders" 
            value={dummyStats.pendingOrders} 
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
              {chartViews.products === 'pie' ? (
                <Pie {...chartConfigs.products.pie} />
              ) : (
                <Bar {...chartConfigs.products.bar} />
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
              {chartViews.deals === 'pie' ? (
                <Pie {...chartConfigs.deals.pie} />
              ) : (
                <Bar {...chartConfigs.deals.bar} />
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
              {dummyRecentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order._id}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs mr-1" />
                        <span>{order.user?.location}</span>
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
              {dummyLowStockProducts.map((product, index) => (
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
          <div className="h-80 ">
            <Bar {...chartConfigs.profitGrowth} />
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