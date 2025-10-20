import { useContext, useEffect, useState } from "react";
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
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [timeLeft, setTimeLeft] = useState({});
  const [cancellationReasons, setCancellationReasons] = useState([]);

  // Load cancellation reasons
  const loadCancellationReasons = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/order/cancellation-reasons');
      if (response.data.success) {
        setCancellationReasons(response.data.cancellationReasons);
      }
    } catch (error) {
      console.error("Failed to load cancellation reasons:", error);
      // Default reasons if API fails
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
  };

  const loadOrderData = async () => {
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
        // ✅ Filter out cancelled orders and reverse the array
        const activeOrders = response.data.orders
          .filter(order => order.status !== "Cancelled")
          .reverse();
        
        setOrders(activeOrders);
        console.log("📦 Active orders loaded:", activeOrders);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrderData();
    loadCancellationReasons();
  }, [token]);

  // Calculate time left for cancellation (15 minute window)
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      orders.forEach(order => {
        if (order.status === "Order Placed") {
          const orderTime = new Date(order.date);
          const currentTime = new Date();
          const timeDifference = currentTime - orderTime;
          const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
          const timeRemaining = fifteenMinutes - timeDifference;
          
          if (timeRemaining > 0) {
            newTimeLeft[order._id] = Math.ceil(timeRemaining / 1000); // Convert to seconds
          } else {
            newTimeLeft[order._id] = 0;
          }
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [orders]);

  // Cancel order function
  const cancelOrder = async (orderId) => {
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
        loadOrderData(); // Refresh orders list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  };

  // Helper function to get item display data
  const getItemDisplayData = (item) => {
    if (item.dealName) {
      return {
        name: item.dealName,
        image: item.dealImages?.[0] || assets.placeholder_image,
        originalPrice: item.dealTotal || 0,
        discountedPrice: item.dealFinalPrice || item.dealTotal || 0,
        type: 'deal',
        description: item.dealDescription
      };
    } else {
      return {
        name: item.name,
        image: item.image?.[0] || assets.placeholder_image,
        originalPrice: item.price || 0,
        discountedPrice: item.discountprice > 0 ? item.discountprice : item.price,
        type: 'product',
        description: item.description
      };
    }
  };

  // Check if order can be cancelled (only within 15 minutes)
  const canCancelOrder = (order) => {
    if (order.status !== "Order Placed") return false;
    
    const orderTime = new Date(order.date);
    const currentTime = new Date();
    const timeDifference = currentTime - orderTime;
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    return timeDifference < fifteenMinutes;
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time percentage for progress bar
  const getTimePercentage = (orderId) => {
    const totalTime = 15 * 60; // 15 minutes in seconds
    const remaining = timeLeft[orderId] || 0;
    return Math.max(0, (remaining / totalTime) * 100);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Placed': return faClock;
      case 'Packing': return faBox;
      case 'Shipped': return faShippingFast;
      case 'Out for delivery': return faMotorcycle;
      case 'Delivered': return faCheckCircle;
      default: return faClock;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Packing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Shipped': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Out for delivery': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Enhanced Cancellation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-lg" />
                <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
              </div>
              <button
                onClick={() => {
                  setCancellingOrder(null);
                  setCancellationReason("");
                  setSelectedReason("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Cancellation Reason *
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify reason *
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide details for cancellation..."
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {cancellationReason.length}/500 characters
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setCancellingOrder(null);
                  setCancellationReason("");
                  setSelectedReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Keep Order
              </button>
        <button
  onClick={() => cancelOrder(cancellingOrder)}
  disabled={!selectedReason || (selectedReason === 'Other' && !cancellationReason.trim())}
  className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
    (!selectedReason || (selectedReason === 'Other' && !cancellationReason.trim())) 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:bg-red-700'
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
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <img src={assets.parcel_icon} alt="No orders" className="opacity-50" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No active orders found</p>
            <p className="text-gray-400 text-sm">Your orders will appear here once you place them</p>
          </div>
        ) : (
          orders.map((order) => {
            const subtotal = order.items.reduce((sum, item) => {
              const itemData = getItemDisplayData(item);
              return sum + (itemData.discountedPrice * item.quantity);
            }, 0);
            
            const total = subtotal + (order.deliveryCharges || 0);
            const isCancellable = canCancelOrder(order);
            const cancellationTimeLeft = timeLeft[order._id] || 0;
            const timePercentage = getTimePercentage(order._id);
            
            return (
              <div key={order._id} className="mb-8 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Order header with summary info */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order._id?.substring(0, 7)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(order.status)} className="mr-2 text-xs" />
                        {order.status}
                      </div>
                    </div>
                  </div>
                
                  {/* Cancellation timer */}
                  {isCancellable && cancellationTimeLeft > 0 && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 text-sm text-yellow-800">
                          <FontAwesomeIcon icon={faClock} className="text-yellow-600" />
                          <span>Time left to cancel:</span>
                          <span className="font-semibold">{formatTime(cancellationTimeLeft)}</span>
                        </div>
                        <span className="text-xs text-yellow-600">
                          {Math.ceil(timePercentage)}% remaining
                        </span>
                      </div>
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${timePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Order items */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => {
                    const itemData = getItemDisplayData(item);
                    
                    return (
                      <div key={index} className="flex flex-col gap-6 p-6 transition-all duration-200 hover:bg-gray-50 md:flex-row md:items-start">
                        {/* Image Section */}
                        <div className="flex-shrink-0 flex justify-center md:justify-start">
                          <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center overflow-hidden bg-white border border-gray-200 rounded-lg">
                            <img 
                              className="w-full h-full object-contain p-2" 
                              src={itemData.image} 
                              alt={itemData.name} 
                              onError={(e) => {
                                e.target.src = assets.placeholder_image;
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-3">
                            <p className="font-semibold text-gray-900 text-lg">{itemData.name}</p>
                            {itemData.type === 'deal' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Deal
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {itemData.originalPrice > itemData.discountedPrice && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Original Price</span>
                                <span className="line-through text-gray-400">
                                  {currency}{(itemData.originalPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                {itemData.type === 'deal' ? 'Deal Price' : 'Price'}
                              </span>
                              <span className="font-medium text-gray-900">
                                {currency}{(itemData.discountedPrice * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Quantity</span>
                              <span className="font-medium text-green-600">{item.quantity}</span>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Unit Price</span>
                              <span className="font-medium text-gray-700">
                                {currency}{itemData.discountedPrice.toFixed(2)}
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
                  })}
                </div>
                
                {/* Order footer with actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                    {/* Address and Payment Info */}
                    <div className="space-y-4 flex-1">
                      <div className="flex items-start space-x-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1 text-sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                          <p className="text-sm text-gray-600">
                            {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.zipcode}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <FontAwesomeIcon icon={faPhone} className="text-gray-400 mt-1 text-sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Contact</p>
                          <p className="text-sm text-gray-600">{order.address?.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <FontAwesomeIcon icon={faCreditCard} className="text-gray-400 mt-1 text-sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Payment</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {order.paymentMethod} • {order.payment ? 'Paid' : 'Cash on Delivery'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Summary and Actions */}
                    <div className="space-y-4 min-w-[250px]">
                      {/* Price Summary */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="font-medium">{currency}{subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Delivery Fee:</span>
                          <span className="font-medium">
                            {order.deliveryCharges === 0 ? (
                              <span className="text-green-600">FREE</span>
                            ) : (
                              `${currency}${order.deliveryCharges.toFixed(2)}`
                            )}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-base font-semibold border-t pt-2">
                          <span className="text-gray-700">Total:</span>
                          <span className="text-gray-900">{currency}{total.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {isCancellable && cancellationTimeLeft > 0 && (
                          <button 
                            onClick={() => setCancellingOrder(order._id)}
                            className="flex-1 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 whitespace-nowrap flex items-center justify-center gap-2"
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
          })
        )}
      </div>
    </div>
  );
};

export default Orders;