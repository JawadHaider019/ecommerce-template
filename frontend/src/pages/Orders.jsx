import { useContext, useEffect, useState, useMemo, useCallback, memo } from "react";
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

// FIXED: Properly handle order data structure for deals
const useItemDisplayData = (item, backendUrl) => {
  return useMemo(() => {
    // If it's from a deal, use deal information
    if (item.isFromDeal === true) {
      let imageUrl = assets.placeholder_image;
      
      // Use deal image first
      if (item.dealImage) {
        imageUrl = item.dealImage;
      } else if (item.image) {
        // Fallback to regular image
        if (Array.isArray(item.image) && item.image.length > 0) {
          imageUrl = item.image[0];
        } else if (typeof item.image === 'string') {
          imageUrl = item.image;
        }
      }

      // Use the actual price from database (not 0)
      const itemPrice = item.price || 0;

      return {
        name: item.dealName || item.name,
        image: imageUrl,
        originalPrice: itemPrice,
        discountedPrice: itemPrice,
        type: 'deal',
        description: item.dealDescription,
        isFromDeal: true
      };
    } else {
      // Regular product
      let imageUrl = assets.placeholder_image;
      
      if (item.image) {
        if (Array.isArray(item.image) && item.image.length > 0) {
          imageUrl = item.image[0];
        } else if (typeof item.image === 'string') {
          imageUrl = item.image;
        } else if (item.image?.url) {
          imageUrl = item.image.url;
        }
      }

      const originalPrice = item.price || 0;
      const discountedPrice = item.discountprice > 0 ? item.discountprice : originalPrice;

      return {
        name: item.name,
        image: imageUrl,
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        type: 'product',
        description: item.description,
        isFromDeal: false
      };
    }
  }, [
    item.id,
    item.isFromDeal,
    item.dealName,
    item.dealImage,
    item.dealDescription,
    item.name,
    item.description,
    item.price,
    item.discountprice,
    item.image,
    backendUrl
  ]);
};

// Memoized Image component with stable props
const OrderItemImage = memo(({ imageUrl, alt, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  return (
    <div className={`flex items-center justify-center overflow-hidden bg-white border border-gray-300 ${className}`}>
      {imageLoading && (
        <div className="flex items-center justify-center w-full h-full">
          <FontAwesomeIcon icon={faImage} className="text-gray-300 text-2xl" />
        </div>
      )}
      
      {!imageError ? (
        <img
          className="w-full h-full object-contain p-2"
          src={imageUrl}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoading ? 'none' : 'block' }}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <FontAwesomeIcon icon={faImage} className="text-gray-400 text-xl mb-2" />
          <span className="text-xs text-gray-500 text-center">No image available</span>
        </div>
      )}
    </div>
  );
});

// Memoized Order Item component with stable props
const OrderItem = memo(({ item, currency, backendUrl }) => {
  const itemData = useItemDisplayData(item, backendUrl);

  // Memoize the calculated prices
  const totalPrice = useMemo(() => 
    (itemData.discountedPrice * item.quantity).toFixed(2),
  [itemData.discountedPrice, item.quantity]);

  const unitPrice = useMemo(() => 
    itemData.discountedPrice.toFixed(2),
  [itemData.discountedPrice]);

  const originalTotalPrice = useMemo(() => 
    (itemData.originalPrice * item.quantity).toFixed(2),
  [itemData.originalPrice, item.quantity]);

  const showOriginalPrice = itemData.originalPrice > itemData.discountedPrice;

  return (
    <div className="flex flex-col gap-6 p-6 transition-all duration-200 hover:bg-gray-50 md:flex-row md:items-start">
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <OrderItemImage 
          imageUrl={itemData.image}
          alt={itemData.name}
          className="w-32 h-32 md:w-36 md:h-36"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-start gap-2 mb-3">
          <p className="font-semibold text-black text-lg">{itemData.name}</p>
          {itemData.isFromDeal && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-black text-white">
              Deal
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {showOriginalPrice && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Original Price</span>
              <span className="line-through text-gray-400">
                {currency}{originalTotalPrice}
              </span>
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">
              {itemData.isFromDeal ? 'Deal Price' : 'Price'}
            </span>
            <span className="font-medium text-black">
              {currency}{totalPrice}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Quantity</span>
            <span className="font-medium text-black">{item.quantity}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Unit Price</span>
            <span className="font-medium text-gray-700">
              {currency}{unitPrice}
            </span>
          </div>
        </div>

        {itemData.description && (
          <p className="text-sm text-gray-500 mt-3">
            {itemData.description.length > 100
              ? `${itemData.description.substring(0, 100)}...`
              : itemData.description
            }
          </p>
        )}
      </div>
    </div>
  );
});

// Memoized Order component
const OrderCard = memo(({ 
  order, 
  currency, 
  backendUrl, 
  isCancellable, 
  cancellationTimeLeft, 
  timePercentage, 
  onCancelOrder 
}) => {
  // Calculate subtotal directly from order items
  const subtotal = useMemo(() => 
    order.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0),
  [order.items]);
  
  const total = useMemo(() => 
    subtotal + (order.deliveryCharges || 0),
  [subtotal, order.deliveryCharges]);

  // Static status functions - no need to recreate on every render
  const statusIcon = useMemo(() => {
    switch (order.status) {
      case 'Order Placed': return faClock;
      case 'Packing': return faBox;
      case 'Shipped': return faShippingFast;
      case 'Out for delivery': return faMotorcycle;
      case 'Delivered': return faCheckCircle;
      default: return faClock;
    }
  }, [order.status]);

  const statusColor = useMemo(() => {
    switch (order.status) {
      case 'Order Placed': return 'text-black bg-gray-100 border-gray-300';
      case 'Packing': return 'text-black bg-gray-100 border-gray-300';
      case 'Shipped': return 'text-black bg-gray-100 border-gray-300';
      case 'Out for delivery': return 'text-black bg-gray-100 border-gray-300';
      case 'Delivered': return 'text-black bg-gray-100 border-gray-300';
      default: return 'text-black bg-gray-100 border-gray-300';
    }
  }, [order.status]);

  const formattedDate = useMemo(() => 
    new Date(parseInt(order.date)).toLocaleString(),
  [order.date]);

  const formatTime = useCallback((seconds) => {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="mb-8 border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Order header with summary info */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-300">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <p className="font-semibold text-black">Order #{order._id?.substring(0, 7)}</p>
            <p className="text-sm text-gray-500">
              {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className={`inline-flex items-center px-3 py-1 border ${statusColor}`}>
              <FontAwesomeIcon icon={statusIcon} className="mr-2 text-xs" />
              {order.status}
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="divide-y divide-gray-200">
        {order.items.map((item, index) => (
          <OrderItem 
            key={`${order._id}-item-${index}-${item.id}`}
            item={item}
            currency={currency}
            backendUrl={backendUrl}
          />
        ))}
      </div>

      {/* Order footer with actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-300">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          {/* Address and Payment Info */}
          <div className="space-y-4 flex-1">
            <div className="flex items-start space-x-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 mt-1 text-sm" />
              <div>
                <p className="text-sm font-medium text-black">Delivery Address</p>
                <p className="text-sm text-gray-600">
                  {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.zipcode}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FontAwesomeIcon icon={faPhone} className="text-gray-500 mt-1 text-sm" />
              <div>
                <p className="text-sm font-medium text-black">Contact</p>
                <p className="text-sm text-gray-600">{order.address?.phone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FontAwesomeIcon icon={faCreditCard} className="text-gray-500 mt-1 text-sm" />
              <div>
                <p className="text-sm font-medium text-black">Payment</p>
                <p className="text-sm text-gray-600 capitalize">
                  {order.paymentMethod} • {order.payment ? 'Paid' : 'Cash on Delivery'}
                </p>
              </div>
            </div>
          </div>

          {/* Price Summary and Actions */}
          <div className="space-y-4 min-w-[250px]">
            {/* Price Summary */}
            <div className="bg-white border border-gray-300 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium text-black">{currency}{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Delivery Fee:</span>
                <span className="font-medium text-black">
                  {order.deliveryCharges === 0 ? (
                    <span className="text-black">FREE</span>
                  ) : (
                    `${currency}${order.deliveryCharges.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold border-t border-gray-300 pt-2">
                <span className="text-black">Total:</span>
                <span className="text-black">{currency}{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isCancellable && cancellationTimeLeft > 0 && (
                <button
                  onClick={() => onCancelOrder(order._id)}
                  className="flex-1 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [timeLeft, setTimeLeft] = useState({});
  const [cancellationReasons, setCancellationReasons] = useState([]);

  // Memoized orders data
  const memoizedOrders = useMemo(() => orders, [orders]);

  // Load cancellation reasons
  const loadCancellationReasons = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + '/api/order/cancellation-reasons');
      if (response.data.success) {
        setCancellationReasons(response.data.cancellationReasons);
      }
    } catch (error) {
      setCancellationReasons([
        "Changed my mind",
        "Found better price elsewhere",
        "Delivery time too long",
        "Ordered by mistake",
        "Product not required anymore",
        "Payment issues",
        "Duplicate order",
        "Shipping address issues",
        "Other"
      ]);
    }
  }, [backendUrl]);

  const loadOrderData = useCallback(async () => {
    try {
      if (!token) {
        return null;
      }
      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        // Sort orders by date in descending order (newest first)
        const activeOrders = response.data.orders
          .filter(order => order.status !== "Cancelled")
          .sort((a, b) => new Date(parseInt(b.date)) - new Date(parseInt(a.date))); // Latest first

        setOrders(activeOrders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    }
  }, [backendUrl, token]);

  useEffect(() => {
    loadOrderData();
    loadCancellationReasons();
  }, [loadOrderData, loadCancellationReasons]);

  // Memoized time left calculation
  const timeLeftMap = useMemo(() => {
    const newTimeLeft = {};
    orders.forEach(order => {
      if (order.status === "Order Placed") {
        const orderTime = new Date(parseInt(order.date));
        const currentTime = new Date();
        const timeDifference = currentTime - orderTime;
        const fifteenMinutes = 15 * 60 * 1000;
        const timeRemaining = fifteenMinutes - timeDifference;

        if (timeRemaining > 0) {
          newTimeLeft[order._id] = Math.ceil(timeRemaining / 1000);
        } else {
          newTimeLeft[order._id] = 0;
        }
      }
    });
    return newTimeLeft;
  }, [orders]);

  // Update timeLeft state less frequently
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(timeLeftMap);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftMap]);

  // Cancel order function
  const cancelOrder = useCallback(async (orderId) => {
    const reason = selectedReason === 'Other' ? cancellationReason : selectedReason;

    if (!reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        {
          orderId,
          cancellationReason: reason.trim()
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setCancellationReason("");
        setSelectedReason("");
        setCancellingOrder(null);
        loadOrderData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  }, [backendUrl, token, selectedReason, cancellationReason, loadOrderData]);

  // Check if order can be cancelled (only within 15 minutes)
  const canCancelOrder = useCallback((order) => {
    if (order.status !== "Order Placed") return false;

    const orderTime = new Date(parseInt(order.date));
    const currentTime = new Date();
    const timeDifference = currentTime - orderTime;
    const fifteenMinutes = 15 * 60 * 1000;

    return timeDifference < fifteenMinutes;
  }, []);

  // Get time percentage for progress bar
  const getTimePercentage = useCallback((orderId) => {
    const totalTime = 15 * 60;
    const remaining = timeLeft[orderId] || 0;
    return Math.max(0, (remaining / totalTime) * 100);
  }, [timeLeft]);

  // Handle cancel order click
  const handleCancelOrderClick = useCallback((orderId) => {
    setCancellingOrder(orderId);
  }, []);

  return (
    <div className="border-t border-gray-300 pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Cancellation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full mx-4 border border-gray-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-300">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-black text-lg" />
                <h3 className="text-lg font-semibold text-black">Cancel Order</h3>
              </div>
              <button
                onClick={() => {
                  setCancellingOrder(null);
                  setCancellationReason("");
                  setSelectedReason("");
                }}
                className="text-gray-500 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Select Cancellation Reason *
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:border-black bg-white"
                  >
                    <option value="">Choose a reason</option>
                    {cancellationReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedReason === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Please specify reason *
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide details for cancellation..."
                      rows="3"
                      className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-black focus:border-black resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {cancellationReason.length}/500 characters
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-300 bg-gray-50">
              <button
                onClick={() => {
                  setCancellingOrder(null);
                  setCancellationReason("");
                  setSelectedReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-black hover:bg-gray-100 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={() => cancelOrder(cancellingOrder)}
                disabled={!selectedReason || (selectedReason === 'Other' && !cancellationReason.trim())}
                className={`flex-1 px-4 py-2 bg-black text-white transition-colors flex items-center justify-center space-x-2 ${
                  (!selectedReason || (selectedReason === 'Other' && !cancellationReason.trim()))
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-800'
                }`}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
                <span>{cancellingOrder ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        {memoizedOrders.length === 0 ? (
          <div className="text-center py-12 border border-gray-300 bg-gray-50">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <img src={assets.parcel_icon} alt="No orders" className="opacity-50" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No active orders found</p>
            <p className="text-gray-400 text-sm">Your orders will appear here once you place them</p>
          </div>
        ) : (
          memoizedOrders.map((order) => {
            const isCancellable = canCancelOrder(order);
            const cancellationTimeLeft = timeLeft[order._id] || 0;
            const timePercentage = getTimePercentage(order._id);

            return (
              <OrderCard
                key={order._id}
                order={order}
                currency={currency}
                backendUrl={backendUrl}
                isCancellable={isCancellable}
                cancellationTimeLeft={cancellationTimeLeft}
                timePercentage={timePercentage}
                onCancelOrder={handleCancelOrderClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;