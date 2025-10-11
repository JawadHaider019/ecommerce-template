import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faChartLine, 
  faClipboardList, 
  faClock, 
  faPlus, 
  faBoxes, 
  faShoppingCart,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, pendingOrders: 0, totalProfit: 0, profitMargin: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mockData = {
    stats: { totalOrders: 156, totalRevenue: 125600, totalProducts: 42, pendingOrders: 23, totalProfit: 50240, profitMargin: 40 },
    recentOrders: [
      { id: '#ORD-001', customer: 'John Doe', amount: 1200, cost: 720, profit: 480, status: 'Delivered', date: '2024-01-15' },
      { id: '#ORD-002', customer: 'Jane Smith', amount: 850, cost: 510, profit: 340, status: 'Processing', date: '2024-01-15' },
      { id: '#ORD-003', customer: 'Mike Johnson', amount: 2100, cost: 1260, profit: 840, status: 'Shipped', date: '2024-01-14' },
      { id: '#ORD-004', customer: 'Sarah Wilson', amount: 950, cost: 570, profit: 380, status: 'Pending', date: '2024-01-14' },
      { id: '#ORD-005', customer: 'David Brown', amount: 1800, cost: 1080, profit: 720, status: 'Delivered', date: '2024-01-13' }
    ],
    topProducts: [
      { name: 'Neem Soap', sales: 45, revenue: 5400, cost: 3240, profit: 2160, profitMargin: 40, stock: 15, lowStock: false },
      { name: 'Aloe Vera Facewash', sales: 32, revenue: 3840, cost: 2304, profit: 1536, profitMargin: 40, stock: 5, lowStock: true },
      { name: 'Herbal Shampoo', sales: 28, revenue: 3360, cost: 2016, profit: 1344, profitMargin: 40, stock: 22, lowStock: false },
      { name: 'Charcoal Soap', sales: 25, revenue: 3000, cost: 1800, profit: 1200, profitMargin: 40, stock: 3, lowStock: true }
    ],
    lowStockProducts: [
      { name: 'Aloe Vera Facewash', stock: 5, idealStock: 20 },
      { name: 'Charcoal Soap', stock: 3, idealStock: 15 },
      { name: 'Lavender Oil', stock: 2, idealStock: 10 }
    ],
    salesTrend: {
      daily: Array.from({length: 7}, (_, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], sales: [12, 18, 15, 22, 28, 35, 26][i], revenue: [4500, 6800, 5600, 8200, 10500, 13200, 9800][i], profit: [1800, 2720, 2240, 3280, 4200, 5280, 3920][i] })),
      weekly: Array.from({length: 4}, (_, i) => ({ week: `Week ${i+1}`, sales: [120, 135, 115, 142][i], revenue: [45000, 51000, 43000, 53000][i], profit: [18000, 20400, 17200, 21200][i] })),
      monthly: Array.from({length: 4}, (_, i) => ({ month: ['Jan', 'Feb', 'Mar', 'Apr'][i], sales: [450, 520, 480, 510][i], revenue: [168000, 195000, 180000, 191000][i], profit: [67200, 78000, 72000, 76400][i] }))
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockData.stats);
      setRecentOrders(mockData.recentOrders);
      setTopProducts(mockData.topProducts);
      setLowStockProducts(mockData.lowStockProducts);
      setSalesTrend(mockData.salesTrend[timeRange]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const StatCard = ({ title, value, icon, color, change, subtitle }) => (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100 hover:shadow-lg md:hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs md:text-sm font-medium mb-1 md:mb-2">{title}</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change && <p className={`text-xs md:text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>{change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last period</p>}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${color} shadow-inner`}>
          <FontAwesomeIcon icon={icon} className="text-lg md:text-xl text-gray-800" />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const statusColors = {
      Delivered: 'bg-green-100 text-green-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-yellow-100 text-yellow-800',
      Pending: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs ${statusColors[status]}`}>{status}</span>;
  };

  const StockBadge = ({ stock }) => (
    <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs ${stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
      {stock} left
    </span>
  );

  const ProfitMarginBar = ({ margin }) => {
    const color = margin >= 30 ? 'bg-green-500' : margin >= 20 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5">
        <div className={`h-2 md:h-2.5 rounded-full ${color}`} style={{ width: `${margin}%` }}></div>
      </div>
    );
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setSalesTrend(mockData.salesTrend[range]);
  };

  if (loading) {
    return (
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
  }

  const quickActions = [
    { to: "/add", icon: faPlus, text: "Add New Product", txt: "blue" },
    { to: "/list", icon: faBoxes, text: "Manage Products", txt: "green" },
    { to: "/orders", icon: faShoppingCart, text: "View Orders", txt: "red" },
      { to: "/content-management", icon: faLayerGroup, text: "Content Management", txt: "yellow" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {['daily', 'weekly', 'monthly'].map(range => (
              <button 
                key={range} 
                onClick={() => handleTimeRangeChange(range)} 
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium ${timeRange === range ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard title="Total Revenue" value={`Rs ${stats.totalRevenue.toLocaleString()}`} icon={faDollarSign} color="bg-green-100" change={8} />
          <StatCard title="Total Profit" value={`Rs ${stats.totalProfit.toLocaleString()}`} subtitle={`${stats.profitMargin}% margin`} icon={faChartLine} color="bg-blue-100" change={10} />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={faClipboardList} color="bg-purple-100" change={12} />
          <StatCard title="Pending Orders" value={stats.pendingOrders} icon={faClock} color="bg-yellow-100" change={-3} />
        </div>

         <div className="my-6 bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <NavLink 
                key={index} 
                to={action.to} 
                className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-gray-50 transition-colors hover:bg-gray-100`}
              >
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Sales Trend</h2>
              <div className="text-xs md:text-sm text-gray-500">{timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Performance</div>
            </div>
            <div className="space-y-4 md:space-y-6">
              {salesTrend.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1 md:mb-2">
                    <span className="font-medium text-gray-900 text-sm md:text-base">{item[timeRange.slice(0, -2)]}</span>
                    <span className="text-xs md:text-sm text-gray-600">{item.sales} sales</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs md:text-sm mb-1 gap-1">
                    <span>Revenue: Rs {item.revenue.toLocaleString()}</span>
                    <span>Profit: Rs {item.profit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 md:h-2.5">
                    <div className="h-2 md:h-2.5 rounded-full bg-blue-500" style={{ width: `${(item.revenue / Math.max(...salesTrend.map(i => i.revenue))) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Low Stock Alert</h2>
              <NavLink to="/list" className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium">Manage Inventory →</NavLink>
            </div>
            <div className="space-y-3 md:space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center p-3 md:p-4 bg-red-50 rounded-lg md:rounded-xl hover:bg-red-100 transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 mr-3 md:mr-4">
                    <FontAwesomeIcon icon={faBoxes} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{product.name}</p>
                    <p className="text-xs md:text-sm text-gray-600">Ideal stock: {product.idealStock}</p>
                  </div>
                  <StockBadge stock={product.stock} />
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
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{order.id}</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Rs {order.amount}</p>
                    <p className="text-xs md:text-sm text-green-600">Profit: Rs {order.profit}</p>
                    <div className="mt-1">
                      <StatusBadge status={order.status} />
                    </div>
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
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 mr-3 md:mr-4">
                    <FontAwesomeIcon icon={faBoxes} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{product.name}</p>
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <span>{product.sales} units sold</span>
                      {product.lowStock && <span className="ml-2 text-red-500">• Low Stock</span>}
                    </div>
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Profit Margin</span>
                        <span>{product.profitMargin}%</span>
                      </div>
                      <ProfitMarginBar margin={product.profitMargin} />
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Rs {product.revenue}</p>
                    <p className="text-xs md:text-sm text-green-600">Rs {product.profit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Dashboard;