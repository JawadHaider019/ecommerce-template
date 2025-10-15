import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, faChartLine, faClipboardList, faClock, faPlus, 
  faBoxes, faShoppingCart, faLayerGroup, faMoneyBillTrendUp,
  faWarehouse, faChartPie, faTags, faArrowTrendUp, faArrowTrendDown,
  faUsers, faUserCheck, faUserPlus, faEye, faMousePointer, faRunning,
  faDownload, faFileExport, faBell, faExclamationTriangle, 
  faExclamationCircle, faChartBar, faFileCsv, faFilePdf, faTimes
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
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    totalOrders: 0, totalRevenue: 0, totalProducts: 0, pendingOrders: 0, 
    totalProfit: 0, profitMargin: 0, totalCost: 0, totalItemsSold: 0,
    averageOrderValue: 0, inventoryValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({});
  const [profitAnalysis, setProfitAnalysis] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // Consolidated mock data
  const mockData = {
    stats: { totalOrders: 156, totalRevenue: 125600, totalProducts: 42, pendingOrders: 23, 
             totalProfit: 50240, profitMargin: 40, totalCost: 75360, totalItemsSold: 289,
             averageOrderValue: 805, inventoryValue: 45200 },
    recentOrders: [
      { id: '#ORD-001', customer: 'John Doe', amount: 1200, cost: 720, profit: 480, profitMargin: 40, status: 'Delivered', date: '2024-01-15', items: 3 },
      { id: '#ORD-002', customer: 'Jane Smith', amount: 850, cost: 510, profit: 340, profitMargin: 40, status: 'Processing', date: '2024-01-15', items: 2 },
      { id: '#ORD-003', customer: 'Mike Johnson', amount: 2100, cost: 1260, profit: 840, profitMargin: 40, status: 'Shipped', date: '2024-01-14', items: 5 },
      { id: '#ORD-004', customer: 'Sarah Wilson', amount: 950, cost: 570, profit: 380, profitMargin: 40, status: 'Pending', date: '2024-01-14', items: 2 },
      { id: '#ORD-005', customer: 'David Brown', amount: 1800, cost: 1080, profit: 720, profitMargin: 40, status: 'Delivered', date: '2024-01-13', items: 4 }
    ],
    topProducts: [
      { name: 'Neem Soap', sales: 45, revenue: 5400, cost: 3240, profit: 2160, profitMargin: 40, stock: 15, lowStock: false, category: 'Skincare' },
      { name: 'Aloe Vera Facewash', sales: 32, revenue: 3840, cost: 2304, profit: 1536, profitMargin: 40, stock: 5, lowStock: true, category: 'Skincare' },
      { name: 'Herbal Shampoo', sales: 28, revenue: 3360, cost: 2016, profit: 1344, profitMargin: 40, stock: 22, lowStock: false, category: 'Haircare' },
      { name: 'Charcoal Soap', sales: 25, revenue: 3000, cost: 1800, profit: 1200, profitMargin: 40, stock: 3, lowStock: true, category: 'Skincare' }
    ],
    lowStockProducts: [
      { name: 'Aloe Vera Facewash', stock: 5, idealStock: 20, cost: 72, value: 360 },
      { name: 'Charcoal Soap', stock: 3, idealStock: 15, cost: 60, value: 180 },
      { name: 'Lavender Oil', stock: 2, idealStock: 10, cost: 150, value: 300 }
    ],
    inventorySummary: { totalItems: 42, totalValue: 45200, categories: 6, outOfStock: 2, lowStock: 5 },
    profitAnalysis: { totalProfit: 50240, profitGrowth: 12, bestCategory: 'Skincare', worstCategory: 'Bath', monthlyTrend: [4200, 4800, 5200, 5024] },
    salesTrend: {
      daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({ 
        day, sales: [12, 18, 15, 22, 28, 35, 26][i], 
        revenue: [4500, 6800, 5600, 8200, 10500, 13200, 9800][i], 
        cost: [2700, 4080, 3360, 4920, 6300, 7920, 5880][i],
        profit: [1800, 2720, 2240, 3280, 4200, 5280, 3920][i] 
      })),
      weekly: Array.from({length: 4}, (_, i) => ({ 
        week: `Week ${i+1}`, sales: [120, 135, 115, 142][i], 
        revenue: [45000, 51000, 43000, 53000][i], cost: [27000, 30600, 25800, 31800][i],
        profit: [18000, 20400, 17200, 21200][i] 
      })),
      monthly: ['Jan', 'Feb', 'Mar', 'Apr'].map((month, i) => ({ 
        month, sales: [450, 520, 480, 510][i], 
        revenue: [168000, 195000, 180000, 191000][i], cost: [100800, 117000, 108000, 114600][i],
        profit: [67200, 78000, 72000, 76400][i] 
      }))
    },
    customerInsights: {
      topCustomers: [
        { name: 'Sarah Wilson', totalSpent: 12500, orders: 8, lastPurchase: '2024-01-15', clv: 15625 },
        { name: 'Mike Johnson', totalSpent: 9800, orders: 6, lastPurchase: '2024-01-14', clv: 12250 },
        { name: 'Emma Davis', totalSpent: 8700, orders: 5, lastPurchase: '2024-01-13', clv: 10875 },
        { name: 'John Doe', totalSpent: 7600, orders: 4, lastPurchase: '2024-01-12', clv: 9500 }
      ],
      retentionRate: 68, customerLifetimeValue: 12500, newVsReturning: { new: 42, returning: 58 },
      customerGrowth: [120, 135, 142, 156, 168, 175]
    },
    userActivity: {
      visits: 12500, conversionRate: 3.2, bounceRate: 42.5, sessionDuration: '4m 25s',
      trafficData: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7'].map((date, i) => ({
        date, visits: [320, 280, 350, 410, 380, 290, 330][i], conversions: [10, 9, 12, 14, 13, 9, 11][i]
      })),
      trafficSources: [
        { source: 'Organic', percentage: 45, color: '#3B82F6' }, { source: 'Direct', percentage: 25, color: '#10B981' },
        { source: 'Social', percentage: 15, color: '#8B5CF6' }, { source: 'Email', percentage: 10, color: '#F59E0B' },
        { source: 'Referral', percentage: 5, color: '#EF4444' }
      ]
    },
    alerts: [
      { id: 1, type: 'stock', title: 'Low Stock Alert', message: '5 products are running low on stock', priority: 'high', timestamp: '2024-01-15 14:30', read: false },
      { id: 2, type: 'order', title: 'Delayed Orders', message: '3 orders are delayed in shipping', priority: 'medium', timestamp: '2024-01-15 12:15', read: false },
      { id: 3, type: 'payment', title: 'Failed Payments', message: '2 payment attempts failed today', priority: 'high', timestamp: '2024-01-15 10:45', read: false },
      { id: 4, type: 'inventory', title: 'Out of Stock', message: 'Charcoal Soap is out of stock', priority: 'high', timestamp: '2024-01-15 09:20', read: true }
    ],
    productCategories: [
      { category: 'Skincare', revenue: 65000, profit: 26000, products: 18 },
      { category: 'Haircare', revenue: 42000, profit: 16800, products: 12 },
      { category: 'Bath & Body', revenue: 28000, profit: 11200, products: 8 },
      { category: 'Fragrance', revenue: 15000, profit: 6000, products: 4 }
    ]
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockData.stats);
      setRecentOrders(mockData.recentOrders);
      setTopProducts(mockData.topProducts);
      setLowStockProducts(mockData.lowStockProducts);
      setSalesTrend(mockData.salesTrend[timeRange]);
      setInventorySummary(mockData.inventorySummary);
      setProfitAnalysis(mockData.profitAnalysis);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeRange]);

  // Reusable components
  const StatCard = ({ title, value, icon, color, change, subtitle, trend }) => (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100 hover:shadow-lg md:hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-xs md:text-sm font-medium mb-1 md:mb-2">{title}</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <div className="flex items-center mt-1">
              <FontAwesomeIcon 
                icon={change > 0 ? faArrowTrendUp : faArrowTrendDown} 
                className={`text-xs mr-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`} 
              />
              <p className={`text-xs md:text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}% from last period
              </p>
            </div>
          )}
          {trend && <div className="flex items-center mt-1"><span className="text-xs text-gray-500">{trend}</span></div>}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${color} shadow-inner`}>
          <FontAwesomeIcon icon={icon} className="text-lg md:text-xl text-gray-800" />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = { Delivered: 'bg-green-100 text-green-800', Processing: 'bg-blue-100 text-blue-800', 
                    Shipped: 'bg-yellow-100 text-yellow-800', Pending: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs ${colors[status]}`}>{status}</span>;
  };

  const StockBadge = ({ stock }) => (
    <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs ${stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
      {stock} left
    </span>
  );

  const AlertBadge = ({ priority }) => {
    const colors = { high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-blue-100 text-blue-800' };
    return <span className={`px-2 py-1 rounded-full text-xs ${colors[priority]}`}>{priority}</span>;
  };

  const ProfitMarginBar = ({ margin }) => {
    const color = margin >= 30 ? 'bg-green-500' : margin >= 20 ? 'bg-yellow-500' : 'bg-red-500';
    return <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5">
      <div className={`h-2 md:h-2.5 rounded-full ${color}`} style={{ width: `${margin}%` }}></div>
    </div>;
  };

  // Chart configurations
  const chartConfigs = {
    revenueTrend: {
      data: {
        labels: salesTrend.map(item => item[timeRange.slice(0, -2)]),
        datasets: [
          {
            label: 'Revenue', data: salesTrend.map(item => item.revenue),
            borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4,
          },
          {
            label: 'Profit', data: salesTrend.map(item => item.profit),
            borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4,
          }
        ]
      },
      options: {
        responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Revenue & Profit Trend' } },
        scales: { y: { beginAtZero: true, ticks: { callback: value => 'Rs ' + value.toLocaleString() } } }
      }
    },
    profitMargin: {
      data: {
        labels: topProducts.map(p => p.name),
        datasets: [{
          label: 'Profit Margin %', data: topProducts.map(p => p.profitMargin),
          backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(245, 158, 11, 0.8)'],
          borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(139, 92, 246)', 'rgb(245, 158, 11)'], borderWidth: 1,
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Profit Margins by Product' } } }
    },
    categoryRevenue: {
      data: {
        labels: mockData.productCategories.map(cat => cat.category),
        datasets: [
          { label: 'Revenue', data: mockData.productCategories.map(cat => cat.revenue), backgroundColor: 'rgba(59, 130, 246, 0.8)' },
          { label: 'Profit', data: mockData.productCategories.map(cat => cat.profit), backgroundColor: 'rgba(16, 185, 129, 0.8)' }
        ]
      },
      options: {
        responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Revenue & Profit by Category' } },
        scales: { y: { beginAtZero: true, ticks: { callback: value => 'Rs ' + (value / 1000).toFixed(0) + 'K' } } }
      }
    },
    trafficSources: {
      data: {
        labels: mockData.userActivity.trafficSources.map(s => s.source),
        datasets: [{
          data: mockData.userActivity.trafficSources.map(s => s.percentage),
          backgroundColor: mockData.userActivity.trafficSources.map(s => s.color), borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Traffic Sources' } } }
    },
    customerGrowth: {
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Total Customers', data: mockData.customerInsights.customerGrowth,
          borderColor: 'rgb(139, 92, 246)', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true, tension: 0.4,
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Customer Growth' } }, scales: { y: { beginAtZero: true } } }
    },
    newVsReturning: {
      data: {
        labels: ['New Customers', 'Returning Customers'],
        datasets: [{
          data: [mockData.customerInsights.newVsReturning.new, mockData.customerInsights.newVsReturning.returning],
          backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'], borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'New vs Returning Customers' } } }
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setSalesTrend(mockData.salesTrend[range]);
  };

  const handleExport = (format) => alert(`Exporting dashboard data as ${format.toUpperCase()}...`);

  const unreadAlertsCount = mockData.alerts.filter(alert => !alert.read).length;

  const AlertsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faBell} className="text-yellow-500 text-xl" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Alerts & Notifications</h3>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadAlertsCount} new</span>
          </div>
          <button onClick={() => setShowAlertsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="divide-y divide-gray-200">
            {mockData.alerts.map(alert => (
              <div key={alert.id} className={`p-4 md:p-6 transition-colors ${!alert.read ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.priority === 'high' ? 'bg-red-100' : alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <FontAwesomeIcon icon={alert.priority === 'high' ? faExclamationTriangle : faExclamationCircle} 
                      className={alert.priority === 'high' ? 'text-red-600' : alert.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${!alert.read ? 'text-blue-900' : 'text-gray-900'}`}>{alert.title}</h4>
                      <div className="flex items-center gap-2">
                        {!alert.read && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
                        <AlertBadge priority={alert.priority} />
                      </div>
                    </div>
                    <p className={`text-sm mb-2 ${!alert.read ? 'text-blue-800' : 'text-gray-600'}`}>{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{mockData.alerts.length} total alerts • {unreadAlertsCount} unread</span>
            <button onClick={() => setShowAlertsModal(false)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 md:h-8 bg-gray-200 rounded w-1/2 md:w-1/4 mb-6 md:mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 md:h-32 bg-gray-200 rounded-xl md:rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="h-64 md:h-96 bg-gray-200 rounded-xl md:rounded-2xl"></div>
            <div className="h-64 md:h-96 bg-gray-200 rounded-xl md:rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const quickActions = [
    { to: "/add", icon: faPlus, text: "Add New Product", txt: "blue" },
    { to: "/list", icon: faBoxes, text: "Manage Products", txt: "green" },
    { to: "/orders", icon: faShoppingCart, text: "View Orders", txt: "red" },
    { to: "/content-management", icon: faLayerGroup, text: "Content Management", txt: "yellow" }
  ];

  const tabs = {
    overview: (
      <>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard title="Total Revenue" value={`Rs ${stats.totalRevenue.toLocaleString()}`} icon={faDollarSign} color="bg-green-100" change={8} />
          <StatCard title="Total Profit" value={`Rs ${stats.totalProfit.toLocaleString()}`} subtitle={`${stats.profitMargin}% margin`} icon={faChartLine} color="bg-blue-100" change={10} />
          <StatCard title="Total Cost" value={`Rs ${stats.totalCost.toLocaleString()}`} icon={faMoneyBillTrendUp} color="bg-red-100" change={5} />
          <StatCard title="Items Sold" value={stats.totalItemsSold} subtitle={`${stats.averageOrderValue.toFixed(0)} avg/order`} icon={faShoppingCart} color="bg-purple-100" change={15} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <div className="h-80"><Line {...chartConfigs.revenueTrend} /></div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <div className="h-80"><Bar {...chartConfigs.categoryRevenue} /></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard title="Inventory Value" value={`Rs ${stats.inventoryValue.toLocaleString()}`} icon={faWarehouse} color="bg-indigo-100" subtitle={`${stats.totalProducts} products`} />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={faClipboardList} color="bg-orange-100" change={12} />
          <StatCard title="Pending Orders" value={stats.pendingOrders} icon={faClock} color="bg-yellow-100" change={-3} />
          <StatCard title="Profit Growth" value={`+${profitAnalysis.profitGrowth}%`} icon={faChartPie} color="bg-teal-100" subtitle="This month" trend={`Best: ${profitAnalysis.bestCategory}`} />
        </div>

        <div className="my-6 bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {quickActions.map((action, i) => (
              <NavLink key={i} to={action.to} className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-gray-50 transition-colors hover:bg-gray-100`}>
                <div className={`w-8 h-8 md:w-10 md:h-10 bg-${action.txt}-100 rounded-lg flex items-center justify-center transition-colors`}>
                  <FontAwesomeIcon icon={action.icon} className={`text-${action.txt}-600 text-sm md:text-base`} />
                </div>
                <span className="font-medium text-gray-900 text-sm md:text-base">{action.text}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <div className="h-80"><Bar {...chartConfigs.profitMargin} /></div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Inventory Summary</h2>
              <NavLink to="/list" className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium">Manage Inventory →</NavLink>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Total Products</p><p className="text-2xl font-bold text-gray-900">{inventorySummary.totalItems}</p></div>
              <div className="bg-green-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Inventory Value</p><p className="text-2xl font-bold text-gray-900">Rs {inventorySummary.totalValue?.toLocaleString()}</p></div>
              <div className="bg-yellow-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Low Stock Items</p><p className="text-2xl font-bold text-gray-900">{inventorySummary.lowStock}</p></div>
              <div className="bg-red-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Out of Stock</p><p className="text-2xl font-bold text-gray-900">{inventorySummary.outOfStock}</p></div>
            </div>
            <div className="space-y-3 md:space-y-4">
              {lowStockProducts.map((product, i) => (
                <div key={i} className="flex items-center p-3 md:p-4 bg-red-50 rounded-lg md:rounded-xl hover:bg-red-100 transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 mr-3 md:mr-4">
                    <FontAwesomeIcon icon={faBoxes} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{product.name}</p>
                    <p className="text-xs md:text-sm text-gray-600">Ideal: {product.idealStock} • Cost: Rs {product.cost}</p>
                  </div>
                  <div className="text-right"><StockBadge stock={product.stock} /><p className="text-xs text-gray-500 mt-1">Value: Rs {product.value}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent Orders</h2>
              <NavLink to="/orders" className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium">View all →</NavLink>
            </div>
            <div className="space-y-3 md:space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">{order.id}</p>
                      <span className="text-xs text-gray-500">{order.items} items</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{order.customer}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Cost: Rs {order.cost}</span>
                      <span className="text-xs text-green-500">Profit: Rs {order.profit}</span>
                      <span className="text-xs text-blue-500">Margin: {order.profitMargin}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Rs {order.amount}</p>
                    <div className="mt-1"><StatusBadge status={order.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Top Selling Products</h2>
              <NavLink to="/list" className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium">View all →</NavLink>
            </div>
            <div className="space-y-3 md:space-y-4">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 mr-3 md:mr-4">
                    <FontAwesomeIcon icon={faBoxes} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">{product.name}</p>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{product.category}</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-600 mb-2">
                      <span>{product.sales} units sold</span>
                      {product.lowStock && <span className="ml-2 text-red-500">• Low Stock</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                      <span>Cost: Rs {product.cost}</span>
                      <span>Revenue: Rs {product.revenue}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Profit Margin</span>
                      <span>{product.profitMargin}%</span>
                    </div>
                    <ProfitMarginBar margin={product.profitMargin} />
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Rs {product.profit}</p>
                    <p className="text-xs md:text-sm text-green-600">Profit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Profit Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 md:p-6 rounded-lg">
              <FontAwesomeIcon icon={faChartLine} className="text-green-600 text-xl mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Total Profit</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">Rs {profitAnalysis.totalProfit?.toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-1">+{profitAnalysis.profitGrowth}% growth</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-lg">
              <FontAwesomeIcon icon={faTags} className="text-blue-600 text-xl mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Best Category</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{profitAnalysis.bestCategory}</p>
              <p className="text-blue-600 text-sm mt-1">Highest profit margin</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 md:p-6 rounded-lg">
              <FontAwesomeIcon icon={faChartPie} className="text-purple-600 text-xl mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Monthly Trend</h3>
              <div className="flex items-center justify-between">
                {profitAnalysis.monthlyTrend?.map((profit, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-600">M{i+1}</div>
                    <div className="text-sm font-semibold text-gray-900">Rs {(profit/1000).toFixed(0)}K</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    ),
    customers: (
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Customer Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100"><div className="h-80"><Line {...chartConfigs.customerGrowth} /></div></div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100"><div className="h-80"><Doughnut {...chartConfigs.newVsReturning} /></div></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Top Customers</h3>
            <div className="space-y-4">
              {mockData.customerInsights.topCustomers.map((customer, i) => (
                <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3"><FontAwesomeIcon icon={faUsers} className="text-blue-600" /></div>
                    <div><p className="font-medium text-gray-900">{customer.name}</p><p className="text-xs text-gray-600">{customer.orders} orders</p></div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Rs {customer.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">CLV: Rs {customer.clv.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Customer Metrics</h3>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
                <FontAwesomeIcon icon={faUserCheck} className="text-blue-600 text-xl mb-2" />
                <h4 className="font-semibold text-gray-900">Retention Rate</h4>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{mockData.customerInsights.retentionRate}%</p>
              </div>
              <div className="bg-green-50 p-4 md:p-6 rounded-lg">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-xl mb-2" />
                <h4 className="font-semibold text-gray-900">CLV</h4>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">Rs {mockData.customerInsights.customerLifetimeValue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-4 md:p-6 rounded-lg col-span-2">
                <FontAwesomeIcon icon={faUserPlus} className="text-purple-600 text-xl mb-2" />
                <h4 className="font-semibold text-gray-900">Customer Growth</h4>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">+{mockData.customerInsights.customerGrowth[mockData.customerInsights.customerGrowth.length - 1] - mockData.customerInsights.customerGrowth[0]}</p>
                <p className="text-sm text-gray-600">This year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    analytics: (
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Traffic Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100"><div className="h-80"><Pie {...chartConfigs.trafficSources} /></div></div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Traffic & Conversions</h3>
            <div className="space-y-4">
              {mockData.userActivity.trafficData.map((day, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{day.date}</span>
                    <span className="text-sm text-gray-600">{day.conversions} conversions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(day.visits / 500) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{day.visits} visits</span>
                    <span>{((day.conversions / day.visits) * 100).toFixed(1)}% conversion</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Traffic Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-blue-50 p-4 rounded-lg"><FontAwesomeIcon icon={faEye} className="text-blue-600 mb-2" /><p className="text-sm text-gray-600">Total Visits</p><p className="text-2xl font-bold text-gray-900">{mockData.userActivity.visits.toLocaleString()}</p></div>
            <div className="bg-green-50 p-4 rounded-lg"><FontAwesomeIcon icon={faMousePointer} className="text-green-600 mb-2" /><p className="text-sm text-gray-600">Conversion Rate</p><p className="text-2xl font-bold text-gray-900">{mockData.userActivity.conversionRate}%</p></div>
            <div className="bg-yellow-50 p-4 rounded-lg"><FontAwesomeIcon icon={faRunning} className="text-yellow-600 mb-2" /><p className="text-sm text-gray-600">Bounce Rate</p><p className="text-2xl font-bold text-gray-900">{mockData.userActivity.bounceRate}%</p></div>
            <div className="bg-purple-50 p-4 rounded-lg"><FontAwesomeIcon icon={faClock} className="text-purple-600 mb-2" /><p className="text-sm text-gray-600">Avg. Session</p><p className="text-2xl font-bold text-gray-900">{mockData.userActivity.sessionDuration}</p></div>
          </div>
        </div>
      </div>
    ),
    reports: (
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: faChartBar, title: "Sales Report", desc: "Complete sales data with revenue, costs, and profit analysis", color: "blue" },
            { icon: faBoxes, title: "Inventory Report", desc: "Stock levels, low stock alerts, and inventory valuation", color: "green" },
            { icon: faUsers, title: "Customer Report", desc: "Customer insights, CLV, retention rates, and behavior", color: "purple" }
          ].map((report, i) => (
            <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 shadow-md md:shadow-lg border border-gray-100">
              <FontAwesomeIcon icon={report.icon} className={`text-${report.color}-600 text-2xl mb-4`} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{report.desc}</p>
              <div className="flex gap-2">
                <button onClick={() => handleExport('csv')} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <FontAwesomeIcon icon={faFileCsv} className="mr-2" />CSV
                </button>
                <button onClick={() => handleExport('pdf')} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm">
                  <FontAwesomeIcon icon={faFilePdf} className="mr-2" />PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {['daily', 'weekly', 'monthly'].map(range => (
                <button key={range} onClick={() => handleTimeRangeChange(range)} 
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium ${timeRange === range ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAlertsModal(true)} className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              {unreadAlertsCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">{unreadAlertsCount}</span>}
            </button>
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {['overview', 'customers', 'analytics', 'reports'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showAlertsModal && <AlertsModal />}
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default Dashboard;