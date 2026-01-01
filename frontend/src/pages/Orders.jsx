import { useContext, useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from '../components/Title';
import axios from "axios";
import { assets } from "../assets/assets";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimesCircle,
  faClock,
  faBox,
  faShippingFast,
  faMotorcycle,
  faCheckCircle,
  faPhone,
  faMapMarkerAlt,
  faCreditCard,
  faExclamationTriangle,
  faImage,
  faUser,
  faSearch,
  faShoppingBag,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

// Global image cache
const imageCache = new Map();
const MAX_CACHE_SIZE = 100;

// Status configuration
const STATUS_CONFIG = {
  'Order Placed': { icon: faClock, color: 'text-yellow-700 bg-yellow-50' },
  'Packing': { icon: faBox, color: 'text-blue-700 bg-blue-50' },
  'Shipped': { icon: faShippingFast, color: 'text-purple-700 bg-purple-50' },
  'Out for delivery': { icon: faMotorcycle, color: 'text-orange-700 bg-orange-50' },
  'Delivered': { icon: faCheckCircle, color: 'text-green-700 bg-green-50' },
  'Pending Verification': { icon: faClock, color: 'text-orange-700 bg-orange-50' },
  'Payment Rejected': { icon: faTimesCircle, color: 'text-red-700 bg-red-50' },
  'Processing': { icon: faBox, color: 'text-blue-700 bg-blue-50' },
  'Cancelled': { icon: faTimesCircle, color: 'text-red-700 bg-red-50' }
};

// Image URL resolver
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
    } else if (image in assets) {
      url = assets[image];
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

// Image preloader
const preloadImages = (urls) => {
  if (!urls.length) return;
  
  const validUrls = urls.filter(url => url && url !== assets.placeholder_image);
  
  setTimeout(() => {
    validUrls.forEach(url => {
      if (!imageCache.get(`loaded-${url}`)) {
        const img = new Image();
        img.src = url;
        imageCache.set(`loaded-${url}`, true);
      }
    });
  }, 100);
};

// 🆕 ENHANCED: Get product image with better fallbacks
const getProductImageById = async (productId, productName, backendUrl) => {
  if (!productId && !productName) return assets.placeholder_image;
  
  try {
    // First try: Get from localStorage cache
    const cachedProducts = localStorage.getItem('productCache');
    if (cachedProducts) {
      const products = JSON.parse(cachedProducts);
      
      // Try by ID first
      if (productId) {
        const cachedProduct = products.find(p => p._id === productId);
        if (cachedProduct?.image?.[0]) {
          return resolveImageUrl(cachedProduct.image[0], backendUrl);
        }
      }
      
      // Try by name if ID not found
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
    
    // Second try: Fetch from backend by ID
    if (productId) {
      try {
        const response = await axios.get(`${backendUrl}/api/products/${productId}`);
        if (response.data.success && response.data.data?.image?.[0]) {
          return resolveImageUrl(response.data.data.image[0], backendUrl);
        }
      } catch (error) {
        console.log("Failed to fetch product by ID, trying by name:", error);
      }
    }
    
    // Third try: Search by name
    if (productName) {
      try {
        const response = await axios.get(`${backendUrl}/api/products/search`, {
          params: { name: productName }
        });
        if (response.data.success && response.data.data?.[0]?.image?.[0]) {
          return resolveImageUrl(response.data.data[0].image[0], backendUrl);
        }
      } catch (error) {
        console.log("Failed to fetch product by name:", error);
      }
    }
    
    // Fourth try: Get all products and search locally
    try {
      const response = await axios.get(`${backendUrl}/api/products`);
      if (response.data.success && response.data.data) {
        const products = response.data.data;
        
        // Cache products for future use
        localStorage.setItem('productCache', JSON.stringify(products));
        
        // Search for product
        const product = products.find(p => 
          (productId && p._id === productId) || 
          (productName && p.name?.toLowerCase().includes(productName?.toLowerCase()))
        );
        
        if (product?.image?.[0]) {
          return resolveImageUrl(product.image[0], backendUrl);
        }
      }
    } catch (error) {
      console.log("Failed to fetch all products:", error);
    }
    
  } catch (error) {
    console.error("Error in getProductImageById:", error);
  }
  
  return assets.placeholder_image;
};

// 🆕 SIMPLIFIED Order Item component that works with any data
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
        
        // Priority 1: Direct image from item
        if (item.image) {
          if (Array.isArray(item.image) && item.image.length > 0) {
            url = resolveImageUrl(item.image[0], backendUrl);
          } else {
            url = resolveImageUrl(item.image, backendUrl);
          }
        }
        // Priority 2: Deal image
        else if (item.isFromDeal && item.dealImage) {
          url = resolveImageUrl(item.dealImage, backendUrl);
        }
        // Priority 3: Try to get product image
        else if (item.id || item.name) {
          url = await getProductImageById(item.id, item.name, backendUrl);
        }
        
        setImageUrl(url);
        
        // Test if image loads
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
        console.error("Error loading order item image:", error);
        setLoading(false);
        setImageError(true);
        setImageUrl(assets.placeholder_image);
      }
    };
    
    loadImage();
  }, [item, backendUrl]);

  // Calculate prices
  const itemPrice = item.price || 0;
  const quantity = item.quantity || 1;
  const totalPrice = itemPrice * quantity;
  
  // Check if it's a deal with savings
  const isDeal = item.isFromDeal === true;
  const hasSavings = item.savings > 0;
  const originalPrice = item.originalTotalPrice || totalPrice;
  const savings = hasSavings ? item.savings : 0;
  const showSavings = isDeal && hasSavings && originalPrice > totalPrice;

  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center animate-pulse">
              <FontAwesomeIcon icon={faImage} className="text-gray-300 text-lg" />
            </div>
          ) : imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 text-center">No image</span>
            </div>
          ) : (
            <img
              className="w-full h-full object-cover"
              src={imageUrl}
              alt={item.name || 'Product'}
              loading="lazy"
              decoding="async"
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
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm leading-tight truncate">
              {item.name || 'Unnamed Product'}
            </p>
            {item.category && (
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            )}
          </div>
          <p className="font-medium text-gray-900 text-sm shrink-0">
            {currency}{totalPrice.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Price</span>
            <span className="font-medium text-gray-700">
              {currency}{itemPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Quantity</span>
            <span className="font-medium text-gray-900">{quantity}</span>
          </div>

          {showSavings && (
            <div className="flex flex-col col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">Original:</span>
                <span className="text-gray-400 text-xs line-through">
                  {currency}{originalPrice.toFixed(2)}
                </span>
                <span className="text-green-600 text-xs font-medium">
                  Save {currency}{savings.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
});

// Order Card component
const OrderCard = memo(({ order, currency, backendUrl, onCancelOrder }) => {
  const { subtotal, total, formattedDate, statusIcon, statusColor } = useMemo(() => {
    const subtotal = order.items?.reduce((sum, item) => 
      sum + ((item.price || 0) * (item.quantity || 1)), 0
    ) || 0;
    
    const total = subtotal + (order.deliveryCharges || 0);
    const date = order.orderPlacedAt || order.date;
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Order Placed'];

    return { 
      subtotal, 
      total, 
      formattedDate, 
      statusIcon: status.icon, 
      statusColor: status.color 
    };
  }, [order]);

  // Check if order is from guest
  const isGuestOrder = order.orderType === 'guest' || order.isGuest || (!order.userId && order.customerDetails?.email);

  // Handle cancel order
  const handleCancelClick = useCallback(() => {
    if (onCancelOrder) {
      onCancelOrder(order._id);
    }
  }, [order._id, onCancelOrder]);

  return (
    <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-black/50">
        <div className="flex justify-between items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900">Order #{order._id?.substring(order._id.length - 6).toUpperCase()}</p>
              {isGuestOrder && (
                <span className="inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-md">
                  <FontAwesomeIcon icon={faUser} className="mr-1" />
                  Guest
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className={`inline-flex border rounded-lg border-black/50 items-center px-3 py-2 text-sm font-medium ${statusColor}`}>
            <FontAwesomeIcon icon={statusIcon} className="mr-2" />
            <span>{order.status}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {order.items?.map((item, index) => (
          <OrderItem 
            key={`${order._id}-${item.id || index}`}
            item={item}
            currency={currency}
            backendUrl={backendUrl}
          />
        )) || (
          <div className="p-4 text-center text-gray-500">
            No items found in this order
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-black/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {/* Info */}
          <div className="space-y-2 flex-1 min-w-0">
            {order.address && (
              <div className="flex items-center gap-2 text-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-900 shrink-0" />
                <span className="text-gray-900 truncate">
                  {order.address.city}, {order.address.state}
                  {order.address.zipcode && ` (${order.address.zipcode})`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon={faCreditCard} className="text-gray-900 shrink-0" />
              <span className="text-gray-900 capitalize">
                {order.paymentMethod } • {order.paymentStatus}
              </span>
            </div>
            {isGuestOrder && order.customerDetails?.email && (
              <div className="flex items-center gap-2 text-sm">
                <FontAwesomeIcon icon={faUser} className="text-gray-900 shrink-0" />
                <span className="text-gray-900 truncate">
                  {order.customerDetails.email}
                </span>
              </div>
            )}
          </div>

          {/* Price & Actions */}
          <div className="space-y-2 min-w-[140px]">
            <div className="bg-white p-3 text-sm rounded-2xl border border-black/50">
              <div className="flex justify-between mb-1">
                <span className="text-gray-900">Subtotal:</span>
                <span className="font-medium text-gray-900">{currency}{subtotal.toFixed(2)}</span>
              </div>
              {order.deliveryCharges > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-900">Delivery:</span>
                  <span className="font-medium text-gray-900">{currency}{order.deliveryCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-gray-300">
                <span className="text-gray-900 font-semibold">Total:</span>
                <span className="font-semibold text-gray-900">{currency}{total.toFixed(2)}</span>
              </div>
            </div>

            {onCancelOrder && (
              <button
                onClick={handleCancelClick}
                className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Main component
const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all orders
  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();

    const loadData = async () => {
      try {
        if (mounted) setLoading(true);
        
        if (token) {
          // Logged-in user: Load from backend
          try {
            const response = await axios.post(
              backendUrl + '/api/order/userorders',
              {},
              { 
                headers: { token },
                timeout: 10000,
                signal: controller.signal
              }
            );

            if (mounted && response.data.success) {
              const sortedOrders = (response.data.orders || [])
                .filter(order => order.status !== "Cancelled")
                .sort((a, b) => {
                  const dateA = a.orderPlacedAt ? new Date(a.orderPlacedAt) : new Date(parseInt(a.date || Date.now()));
                  const dateB = b.orderPlacedAt ? new Date(b.orderPlacedAt) : new Date(parseInt(b.date || Date.now()));
                  return dateB - dateA;
                });

              setOrders(sortedOrders);
            }
          } catch (error) {
            console.error("Error loading user orders:", error);
            if (mounted) toast.error("Failed to load orders");
          }
        } else {
          // Guest user: Try to load from backend first using localStorage info
          const guestOrderInfo = localStorage.getItem('guestOrderInfo');
          let guestOrders = [];
          
          if (guestOrderInfo) {
            try {
              const { email, orderId } = JSON.parse(guestOrderInfo);
              
              // Try to get the order
              if (orderId && email) {
                const trackResponse = await axios.post(
                  backendUrl + '/api/order/guest/track',
                  { orderId, email },
                  { timeout: 10000, signal: controller.signal }
                );

                if (mounted && trackResponse.data.success) {
                  guestOrders = [trackResponse.data.order];
                }
              }
            } catch (error) {
              console.log("Could not fetch guest orders from backend:", error);
            }
          }
          
          // Also check localStorage for any saved guest orders
          try {
            const savedGuestOrders = localStorage.getItem('guestOrders');
            if (savedGuestOrders) {
              const parsedOrders = JSON.parse(savedGuestOrders);
              // Merge with backend orders
              parsedOrders.forEach(savedOrder => {
                if (!guestOrders.some(order => order._id === savedOrder._id)) {
                  guestOrders.push(savedOrder);
                }
              });
            }
          } catch (error) {
            console.error("Error loading guest orders from localStorage:", error);
          }
          
          // Check for recent guest order
          try {
            const recentOrder = localStorage.getItem('recentGuestOrder');
            if (recentOrder) {
              const parsedOrder = JSON.parse(recentOrder);
              if (!guestOrders.some(order => order._id === parsedOrder._id)) {
                guestOrders.unshift(parsedOrder);
              }
            }
          } catch (error) {
            console.error("Error loading recent guest order:", error);
          }
          
          // Sort guest orders by date
          const sortedGuestOrders = guestOrders
            .filter(order => order && order.status !== "Cancelled")
            .sort((a, b) => {
              const dateA = a.orderPlacedAt ? new Date(a.orderPlacedAt) : new Date(parseInt(a.date || Date.now()));
              const dateB = b.orderPlacedAt ? new Date(b.orderPlacedAt) : new Date(parseInt(b.date || Date.now()));
              return dateB - dateA;
            });

          if (mounted) {
            setOrders(sortedGuestOrders);
          }
        }
      } catch (error) {
        console.error("Error in loadData:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [backendUrl, token]);

  if (loading) {
    return (
      <div className="pt-16">
        <div className="text-3xl mb-8 text-center">
          <Title text1={"My"} text2={"Orders"} />
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="text-3xl mb-8 text-center">
        <Title text1={"My"} text2={"Orders"} />
      </div>

      {/* Orders List */}
      <div>
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/50 p-8 text-center">
            <div className="mx-auto h-16 w-16 text-gray-900 mb-4">
              <FontAwesomeIcon icon={faShoppingBag} className="text-4xl opacity-50" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-900 text-sm mb-6">
              {token 
                ? "You haven't placed any orders yet."
                : "You haven't placed any orders yet."}
            </p>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              currency={currency}
              backendUrl={backendUrl}
            />
          ))
        )}
      </div>

    </div>
  );
};

export default Orders;