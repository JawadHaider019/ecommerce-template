import { useContext, useEffect, useState, useMemo, useCallback, memo, lazy, Suspense, useRef } from "react";
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
  faImage
} from '@fortawesome/free-solid-svg-icons';

// Global image cache with LRU behavior
const imageCache = new Map();
const MAX_CACHE_SIZE = 100;

// Ultra-fast image URL resolver
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
    } else {
      url = image;
    }
  }

  // LRU cache management
  if (imageCache.size >= MAX_CACHE_SIZE) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  
  imageCache.set(cacheKey, url);
  return url;
};

// Optimized image preloader
const preloadImages = (urls) => {
  if (!urls.length) return;
  
  const validUrls = urls.filter(url => url && url !== assets.placeholder_image);
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      validUrls.forEach(url => {
        if (!imageCache.get(`loaded-${url}`)) {
          const img = new Image();
          img.src = url;
          imageCache.set(`loaded-${url}`, true);
        }
      });
    });
  } else {
    setTimeout(() => {
      validUrls.forEach(url => {
        if (!imageCache.get(`loaded-${url}`)) {
          const img = new Image();
          img.src = url;
          imageCache.set(`loaded-${url}`, true);
        }
      });
    }, 100);
  }
};

// Optimized Image component with intersection observer
const OrderItemImage = memo(({ imageUrl, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(imageCache.get(`loaded-${imageUrl}`) || false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (imageCache.get(`loaded-${imageUrl}`)) {
      setLoaded(true);
      return;
    }

    let mounted = true;
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(`loaded-${imageUrl}`, true);
      if (mounted) {
        setLoaded(true);
        setError(false);
      }
    };
    
    img.onerror = () => {
      if (mounted) {
        setError(true);
        setLoaded(true);
      }
    };
    
    img.src = imageUrl;

    return () => {
      mounted = false;
    };
  }, [imageUrl, inView]);

  const displayUrl = error ? assets.placeholder_image : imageUrl;

  return (
    <div 
      ref={imgRef}
      className={`flex items-center justify-center overflow-hidden bg-gray-50 ${className}`}
    >
      {!loaded ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 animate-pulse">
          <FontAwesomeIcon icon={faImage} className="text-gray-300" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-2 bg-gray-100">
          <FontAwesomeIcon icon={faImage} className="text-gray-900 mb-1" />
          <span className="text-xs text-gray-500">No image</span>
        </div>
      ) : (
        <img
          className="w-full h-full object-cover"
          src={displayUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
});

// Ultra-fast Order Item with memoized calculations
const OrderItem = memo(({ item, currency, backendUrl }) => {
  const itemData = useMemo(() => {
    const isDeal = item.isFromDeal === true;
    const imageSource = isDeal ? (item.dealImage || item.image) : item.image;
    const imageUrl = resolveImageUrl(imageSource, backendUrl);
    const price = item.price || 0;
    const discountPrice = item.discountprice > 0 ? item.discountprice : price;
    
    return {
      name: isDeal ? (item.dealName || item.name) : item.name,
      image: imageUrl,
      originalPrice: price,
      discountedPrice: discountPrice,
      isFromDeal: isDeal,
      description: isDeal ? item.dealDescription : item.description
    };
  }, [item, backendUrl]);

  const { totalPrice, unitPrice, originalTotalPrice, showOriginalPrice } = useMemo(() => ({
    totalPrice: (itemData.discountedPrice * item.quantity).toFixed(2),
    unitPrice: itemData.discountedPrice.toFixed(2),
    originalTotalPrice: (itemData.originalPrice * item.quantity).toFixed(2),
    showOriginalPrice: itemData.originalPrice > itemData.discountedPrice
  }), [itemData, item.quantity]);

  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <OrderItemImage 
          imageUrl={itemData.image}
          alt={itemData.name}
          className="w-20 h-20 rounded-2xl"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-2">
          <p className="font-medium text-gray-900 text-sm leading-tight">{itemData.name}</p>
          {itemData.isFromDeal && (
            <span className="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded-md shrink-0">
              Deal
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {showOriginalPrice && (
            <div className="flex flex-col">
              <span className="text-gray-900 text-xs">Original</span>
              <span className="line-through text-gray-900">
                {currency}{originalTotalPrice}
              </span>
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-gray-900 text-xs">{itemData.isFromDeal ? 'Deal' : 'Price'}</span>
            <span className="font-medium text-gray-900">
              {currency}{totalPrice}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-900 text-xs">Quantity</span>
            <span className="font-medium text-gray-900">{item.quantity}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-900 text-xs">Unit Price</span>
            <span className="font-medium text-gray-700">
              {currency}{unitPrice}
            </span>
          </div>
        </div>

        {itemData.description && (
          <p className="text-xs text-gray-900 mt-2 line-clamp-1">
            {itemData.description}
          </p>
        )}
      </div>
    </div>
  );
});

// Status configuration outside component to prevent recreation
const STATUS_CONFIG = {
  'Order Placed': { icon: faClock, color: 'text-yellow-700 bg-yellow-50' },
  'Packing': { icon: faBox, color: 'text-blue-700 bg-blue-50' },
  'Shipped': { icon: faShippingFast, color: 'text-purple-700 bg-purple-50' },
  'Out for delivery': { icon: faMotorcycle, color: 'text-orange-700 bg-orange-50' },
  'Delivered': { icon: faCheckCircle, color: 'text-green-700 bg-green-50' }
};

// Blazing-fast Order Card with optimized calculations
const OrderCard = memo(({ order, currency, backendUrl, isCancellable, onCancelOrder }) => {
  const { subtotal, total, formattedDate, statusIcon, statusColor } = useMemo(() => {
    const subtotal = order.items.reduce((sum, item) => 
      sum + ((item.price || 0) * item.quantity), 0
    );
    const total = subtotal + (order.deliveryCharges || 0);
    const formattedDate = new Date(parseInt(order.date)).toLocaleDateString();
    
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Order Placed'];

    return { 
      subtotal, 
      total, 
      formattedDate, 
      statusIcon: status.icon, 
      statusColor: status.color 
    };
  }, [order]);

  // Preload images for this order only when in viewport
  useEffect(() => {
    const imageUrls = order.items.map(item => {
      const imageSource = item.isFromDeal ? (item.dealImage || item.image) : item.image;
      return resolveImageUrl(imageSource, backendUrl);
    }).filter(url => url !== assets.placeholder_image);
    
    preloadImages(imageUrls);
  }, [order.items, backendUrl]);

  const handleCancelClick = useCallback(() => {
    onCancelOrder(order._id);
  }, [order._id, onCancelOrder]);

  return (
    <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-black/50">
        <div className="flex justify-between items-center">
          <div className="min-w-0">
            <p className="font-medium text-gray-900">Order #{order._id?.substring(0, 8)}</p>
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
        {order.items.map((item, index) => (
          <OrderItem 
            key={`${order._id}-${item.id || index}`}
            item={item}
            currency={currency}
            backendUrl={backendUrl}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-black/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {/* Info */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-900 shrink-0" />
              <span className="text-gray-900 truncate">
                {order.address?.city}, {order.address?.state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon={faCreditCard} className="text-gray-900 shrink-0" />
              <span className="text-gray-900 capitalize">
                {order.paymentMethod} 
              </span>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="space-y-2 min-w-[140px]">
            <div className="bg-white p-3 text-sm rounded-2xl border border-black/50">
              <div className="flex justify-between mb-1">
                <span className="text-gray-900">Subtotal:</span>
                <span className="font-medium text-gray-900">{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">Total:</span>
                <span className="font-semibold text-gray-900">{currency}{total.toFixed(2)}</span>
              </div>
            </div>

            {isCancellable && (
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

// Cancellation Modal Component
const CancellationModal = memo(({ 
  cancellingOrder, 
  setCancellingOrder, 
  selectedReason, 
  setSelectedReason, 
  cancellationReason, 
  setCancellationReason, 
  cancellationReasons, 
  cancelOrder 
}) => {
  const handleConfirm = useCallback(() => {
    cancelOrder(cancellingOrder);
  }, [cancelOrder, cancellingOrder]);

  const handleClose = useCallback(() => {
    setCancellingOrder(null);
  }, [setCancellingOrder]);

  const isConfirmDisabled = !selectedReason || (selectedReason === 'Other' && !cancellationReason.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black/50">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
            <h3 className="font-medium text-gray-900">Cancel Order</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-900 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-900 mb-4">Please tell us why you want to cancel this order:</p>

          <div className="space-y-3">
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2 border border-black/50 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">Select a reason</option>
              {cancellationReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>

            {selectedReason === 'Other' && (
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide details..."
                rows="3"
                className="w-full p-2 border border-black/50 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                maxLength={200}
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-black/50">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-black/50 rounded text-sm hover:bg-gray-50 transition-colors"
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded transition-colors ${
              isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

// Main component with maximum optimization
const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [loading, setLoading] = useState(true);

  const cancellationReasons = useMemo(() => [
    "Changed my mind",
    "Found better price",
    "Delivery time",
    "Ordered by mistake",
    "Not required",
    "Other"
  ], []);

  // Single optimized effect for data loading
  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();

    const loadData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          backendUrl + '/api/order/userorders',
          {},
          { 
            headers: { token },
            timeout: 5000,
            signal: controller.signal
          }
        );

        if (mounted && response.data.success) {
          const activeOrders = response.data.orders
            .filter(order => order.status !== "Cancelled")
            .sort((a, b) => parseInt(b.date) - parseInt(a.date));

          setOrders(activeOrders);

          // Preload all images immediately
          const allImageUrls = activeOrders.flatMap(order => 
            order.items.map(item => {
              const imageSource = item.isFromDeal ? (item.dealImage || item.image) : item.image;
              return resolveImageUrl(imageSource, backendUrl);
            })
          ).filter(url => url !== assets.placeholder_image);
          
          preloadImages(allImageUrls);
        }
      } catch (error) {
        if (mounted && error.code !== 'ECONNABORTED' && error.name !== 'CanceledError') {
          toast.error("Failed to load orders");
        }
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

  const cancelOrder = useCallback(async (orderId) => {
    const reason = selectedReason === 'Other' ? cancellationReason : selectedReason;

    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { orderId, cancellationReason: reason.trim() },
        { headers: { token }, timeout: 3000 }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setOrders(prev => prev.filter(order => order._id !== orderId));
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrder(null);
      setCancellationReason("");
      setSelectedReason("");
    }
  }, [backendUrl, token, selectedReason, cancellationReason]);

  const canCancelOrder = useCallback((order) => {
    if (order.status !== "Order Placed") return false;
    const orderTime = new Date(parseInt(order.date));
    return (Date.now() - orderTime) < (15 * 60 * 1000);
  }, []);

  const handleCancelOrder = useCallback((orderId) => {
    setCancellingOrder(orderId);
  }, []);

  // Memoized orders list
  const ordersList = useMemo(() => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="mx-auto h-12 w-12 text-gray-900 mb-4">
            <img src={assets.parcel_icon} alt="No orders" className="opacity-50" />
          </div>
          <p className="text-gray-900">No active orders found</p>
          <p className="text-gray-900 text-sm mt-1">Your orders will appear here once placed</p>
        </div>
      );
    }

    return orders.map((order) => (
      <OrderCard
        key={order._id}
        order={order}
        currency={currency}
        backendUrl={backendUrl}
        isCancellable={canCancelOrder(order)}
        onCancelOrder={handleCancelOrder}
      />
    ));
  }, [orders, currency, backendUrl, canCancelOrder, handleCancelOrder]);

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

      {/* Cancellation Modal */}
      {cancellingOrder && (
        <CancellationModal
          cancellingOrder={cancellingOrder}
          setCancellingOrder={setCancellingOrder}
          selectedReason={selectedReason}
          setSelectedReason={setSelectedReason}
          cancellationReason={cancellationReason}
          setCancellationReason={setCancellationReason}
          cancellationReasons={cancellationReasons}
          cancelOrder={cancelOrder}
        />
      )}

      <div>
        {ordersList}
      </div>
    </div>
  );
};

export default Orders;