import { useContext, useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from '../components/Title';
import axios from "axios";
import { assets } from "../assets/assets";
import { toast } from 'react-toastify';
import { 
  FaClock,
  FaBox,
  FaShippingFast,
  FaMotorcycle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaCreditCard,
  FaUser,
  FaShoppingBag,
  FaSyncAlt,
  FaCalendarAlt,
  FaReceipt,
  FaChevronRight,
  FaSpinner,
  FaTruck,
  FaBoxOpen,
  FaTag,
  FaImage,
  FaQuestionCircle
} from 'react-icons/fa';

// Global image cache
const imageCache = new Map();
const MAX_CACHE_SIZE = 100;

// Status configuration with colors and icons
const STATUS_CONFIG = {
  'Order Placed': { 
    icon: FaClock, 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    stepColor: 'bg-yellow-500'
  },
  'Packing': { 
    icon: FaBox, 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    stepColor: 'bg-blue-500'
  },
  'Shipped': { 
    icon: FaShippingFast, 
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    stepColor: 'bg-purple-500'
  },
  'Out for delivery': { 
    icon: FaMotorcycle, 
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    stepColor: 'bg-orange-500'
  },
  'Delivered': { 
    icon: FaCheckCircle, 
    color: 'bg-green-50 text-green-700 border-green-200',
    stepColor: 'bg-green-500'
  },
  'Cancelled': { 
    icon: FaClock, 
    color: 'bg-red-50 text-red-700 border-red-200',
    stepColor: 'bg-red-500'
  }
};

// Status steps for progress tracking
const STATUS_STEPS = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'];

// Helper functions (from second component)
const resolveImageUrl = (image, backendUrl) => {
  if (!image) return assets.placeholder_image;
  
  const cacheKey = `${backendUrl}-${JSON.stringify(image)}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  let url = assets.placeholder_image;
  
  if (Array.isArray(image) && image.length > 0) {
    url = image[0];
  } else if (image && typeof image === 'object' && image.url) {
    url = image.url;
  } else if (typeof image === 'string') {
    if (image.startsWith('data:image')) {
      url = image;
    } else if (image.startsWith('/uploads/') && backendUrl) {
      url = `${backendUrl}${image}`;
    } else if (image.startsWith('http')) {
      url = image;
    } else {
      url = image;
    }
  }

  // Cache management
  if (imageCache.size >= MAX_CACHE_SIZE) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  
  imageCache.set(cacheKey, url);
  return url;
};

// Enhanced product image fetching (from second component)
const getProductImageById = async (productId, productName, backendUrl) => {
  if (!productId && !productName) return assets.placeholder_image;
  
  try {
    // First try: Get from localStorage cache
    const cachedProducts = localStorage.getItem('productCache');
    if (cachedProducts) {
      const products = JSON.parse(cachedProducts);
      
      if (productId) {
        const cachedProduct = products.find(p => p._id === productId);
        if (cachedProduct?.image?.[0]) {
          return resolveImageUrl(cachedProduct.image[0], backendUrl);
        }
      }
      
      if (productName) {
        const cachedProduct = products.find(p => 
          p.name?.toLowerCase() === productName?.toLowerCase() || 
          p.name?.toLowerCase().includes(productName?.toLowerCase())
        );
        if (cachedProduct?.image?.[0]) {
          return resolveImageUrl(cachedProduct.image[0], backendUrl);
        }
      }
    }
    
    // Try to fetch from backend
    if (productId) {
      try {
        const response = await axios.get(`${backendUrl}/api/products/${productId}`);
        if (response.data.success && response.data.data?.image?.[0]) {
          return resolveImageUrl(response.data.data.image[0], backendUrl);
        }
      } catch (error) {
        console.log("Failed to fetch product by ID");
      }
    }
    
  } catch (error) {
    console.error("Error in getProductImageById:", error);
  }
  
  return assets.placeholder_image;
};

// Date handling functions (from second component)
const parseOrderDate = (dateValue) => {
  if (!dateValue) return new Date();
  
  try {
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'number') return new Date(dateValue);
    
    if (typeof dateValue === 'string') {
      const parsedNumber = Number(dateValue);
      if (!isNaN(parsedNumber) && dateValue.trim() !== '') {
        return new Date(parsedNumber);
      }
      
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    return new Date();
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date();
  }
};

const formatOrderDate = (dateValue) => {
  const date = parseOrderDate(dateValue);
  
  if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
    return 'Date not available';
  }
  
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getOrderTimestamp = (order) => {
  const dateValue = order.orderPlacedAt || order.date || order.createdAt;
  const date = parseOrderDate(dateValue);
  return date.getTime();
};

// Order Item Component (from second component)
const OrderItem = memo(({ item, currency, backendUrl }) => {
  const [imageUrl, setImageUrl] = useState(assets.placeholder_image);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setImageError(false);
      
      try {
        let url = assets.placeholder_image;
        
        if (item.image) {
          if (Array.isArray(item.image) && item.image.length > 0) {
            url = resolveImageUrl(item.image[0], backendUrl);
          } else {
            url = resolveImageUrl(item.image, backendUrl);
          }
        } else if (item.isFromDeal && item.dealImage) {
          url = resolveImageUrl(item.dealImage, backendUrl);
        } else if (item.id || item.name) {
          url = await getProductImageById(item.id, item.name, backendUrl);
        }
        
        setImageUrl(url);
        
        const img = new Image();
        img.onload = () => {
          setLoading(false);
          setImageError(false);
        };
        img.onerror = () => {
          setLoading(false);
          setImageError(true);
          setImageUrl(assets.placeholder_image);
        };
        img.src = url;
        
      } catch (error) {
        setLoading(false);
        setImageError(true);
        setImageUrl(assets.placeholder_image);
      }
    };
    
    loadImage();
  }, [item, backendUrl]);

  const totalPrice = ((item.price || 0) * (item.quantity || 1)).toFixed(2);
  const unitPrice = (item.price || 0).toFixed(2);
  const isDeal = item.isFromDeal === true;

  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors duration-200 rounded-xl">
      <div className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center animate-pulse">
              <FaImage className="text-gray-300 text-lg" />
            </div>
          ) : imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              <FaImage className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 text-center">No image</span>
            </div>
          ) : (
            <img
              className="w-full h-full object-cover"
              src={imageUrl}
              alt={item.name || 'Product'}
              loading="lazy"
            />
          )}
          
          {isDeal && (
            <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-semibold">
              Deal
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 text-sm">{item.name || 'Unnamed Product'}</h4>
            {isDeal && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full">
                <FaTag className="w-3 h-3 mr-1" />
                Deal
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-gray-900">
            {currency}{totalPrice}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xs">Unit Price:</span>
              <span className="font-medium text-gray-900">{currency}{unitPrice}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xs">Quantity:</span>
              <span className="font-medium text-gray-900">{item.quantity || 1}</span>
            </div>
          </div>
          
          {item.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

// Status Progress Bar (from second component)
const StatusProgress = memo(({ status }) => {
  const currentStepIndex = STATUS_STEPS.indexOf(status);
  
  if (currentStepIndex === -1) return null;
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        {STATUS_STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = step === status;
          const StepIcon = STATUS_CONFIG[step]?.icon || FaQuestionCircle;
          
          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActive ? STATUS_CONFIG[step]?.stepColor : 'bg-gray-100 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-opacity-20 ring-current' : ''}`}>
                <StepIcon className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs mt-2 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="relative -top-4">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200"></div>
        <div 
          className="absolute top-4 left-4 h-0.5 bg-gray-900 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
});

// Order Card Component (from second component UI)
const OrderCard = memo(({ order, currency, backendUrl, isGuest = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const { totalAmount, formattedDate, statusConfig } = useMemo(() => {
    const subtotal = order.items?.reduce((sum, item) => 
      sum + ((item.price || 0) * (item.quantity || 1)), 0
    ) || 0;
    const totalAmount = subtotal + (order.deliveryCharges || 0);
    const formattedDate = formatOrderDate(order.orderPlacedAt || order.date || order.createdAt);
    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Order Placed'];
    
    return { totalAmount, formattedDate, statusConfig: config };
  }, [order]);

  const StatusIcon = statusConfig.icon;

  return (
    <div className="mb-6 bg-white rounded-2xl border border-black hover:border-black transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${statusConfig.color} flex items-center gap-2`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{order.status}</span>
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <FaCalendarAlt className="w-3 h-3" />
                {formattedDate}
              </div>
              {isGuest && (
                <span className="inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-md">
                  <FaUser className="w-3 h-3 mr-1" />
                  Guest
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Order #{order._id?.substring(0, 8).toUpperCase()}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">
                {currency}{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Progress */}
        <StatusProgress status={order.status} />
      </div>

      {/* Collapsible Details */}
      {showDetails && (
        <div className="p-6 border-b border-gray-100">
          {/* Items */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaBoxOpen className="w-4 h-4" />
              Order Items ({order.items?.length || 0})
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <OrderItem
                  key={`${order._id}-${item.id || index}`}
                  item={item}
                  currency={currency}
                  backendUrl={backendUrl}
                />
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  Delivery Address
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-medium text-gray-900">{order.address?.fullName || order.customerDetails?.name}</p>
                  <p className="text-sm text-gray-600">{order.address?.street}</p>
                  <p className="text-sm text-gray-600">
                    {order.address?.city}, {order.address?.state} {order.address?.zipcode}
                  </p>
                  <p className="text-sm text-gray-600">{order.address?.phone || order.customerDetails?.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaReceipt className="w-4 h-4" />
                  Payment & Delivery
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {order.paymentMethod || 'COD'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivery Charges:</span>
                    <span className="font-medium text-gray-900">
                      {currency}{(order.deliveryCharges || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCreditCard className="w-4 h-4" />
              <span className="capitalize">{order.paymentMethod || 'COD'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaTruck className="w-4 h-4" />
              <span>{order.address?.city || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <span>{showDetails ? 'Hide' : 'View'} Details</span>
              <FaChevronRight className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Guest helper functions (from first component)
const loadGuestInfo = () => {
  try {
    const guestInfo = localStorage.getItem('guestOrderInfo');
    if (guestInfo) return JSON.parse(guestInfo);
  } catch (error) {
    console.error('Error loading guest info:', error);
  }
  return null;
};

const loadGuestOrdersFromStorage = () => {
  try {
    const guestOrders = localStorage.getItem('guestOrders');
    if (guestOrders) return JSON.parse(guestOrders);
  } catch (error) {
    console.error('Error loading guest orders:', error);
  }
  return [];
};

// Main Orders Component (with first component's functionality)
const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  
  const isMounted = useRef(true);

  // Load guest info from localStorage on mount
  useEffect(() => {
    const info = loadGuestInfo();
    if (info) {
      setGuestInfo(info);
      setIsGuestMode(true);
    }
  }, []);

  // Fetch orders from backend
  const fetchOrders = useCallback(async (showIndicator = false) => {
    if (!isMounted.current) return;
    
    if (showIndicator) setRefreshing(true);
    
    try {
      let newOrders = [];

      if (token) {
        const response = await axios.post(
          backendUrl + '/api/order/userorders',
          {},
          { headers: { token } }
        );

        if (response.data.success) {
          newOrders = response.data.orders || [];
        }
      } else if (guestInfo) {
        const response = await axios.post(
          backendUrl + '/api/order/guest-orders',
          { email: guestInfo.email, phone: guestInfo.phone }
        );

        if (response.data.success) {
          newOrders = response.data.orders || [];
        }
      } else {
        newOrders = loadGuestOrdersFromStorage();
      }

      // Filter orders - keep cancelled orders for 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      newOrders = newOrders
        .filter(order => {
          if (order.status !== "Cancelled") return true;
          return parseInt(order.date) > oneDayAgo;
        })
        .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

      if (isMounted.current) {
        setOrders(newOrders);
        setLastUpdated(new Date());
        
        if (showIndicator) {
          toast.success(newOrders.length > 0 
            ? `Found ${newOrders.length} orders!` 
            : 'No orders found'
          );
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (showIndicator) toast.error('Failed to fetch orders');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [backendUrl, token, guestInfo]);

  // Initial load
  useEffect(() => {
    isMounted.current = true;
    fetchOrders();
    
    return () => { isMounted.current = false; };
  }, [fetchOrders]);

  // Polling for real-time updates (first component's functionality)
  useEffect(() => {
    if (!guestInfo && !token) return;

    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchOrders, guestInfo, token]);

  // Refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchOrders]);

  // Refresh on focus
  useEffect(() => {
    const handleFocus = () => fetchOrders(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchOrders]);

  // Manual refresh handler
  const handleRefresh = () => fetchOrders(true);

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return lastUpdated.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Title text1="My" text2="Orders" />
            <p className="text-gray-600 mt-4">Loading your orders...</p>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading your order history</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Title text1="My" text2="Orders" />
            <p className="text-gray-600 mt-4">Your order history will appear here</p>
          </div>
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {token 
                ? "You haven't placed any orders yet. Start shopping to see your order history here."
                : "You haven't placed any orders yet. Start shopping to see your order history here."}
            </p>
            <button
              onClick={() => window.location.href = '/collection'}
              className="group inline-flex items-center gap-3 bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all"
            >
              <span>Browse Products</span>
              <FaChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with refresh button */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center">
            <Title text1="My" text2="Orders" />
            
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Updated {getLastUpdatedText()}
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  refreshing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FaSyncAlt className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-4">Track and manage all your orders in one place</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              currency={currency}
              backendUrl={backendUrl}
              isGuest={isGuestMode}
            />
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need help with an order? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Orders;