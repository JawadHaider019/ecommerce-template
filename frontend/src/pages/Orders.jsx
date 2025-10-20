import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from '../components/Title';
import axios from "axios";
import { assets } from "../assets/assets";
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [timeLeft, setTimeLeft] = useState({});

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
    if (!cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { 
          orderId, 
          cancellationReason: cancellationReason.trim() 
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        setCancellationReason("");
        setCancellingOrder(null);
        loadOrderData(); // Refresh orders list (will automatically hide cancelled order)
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

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Cancellation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for cancellation:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Changed my mind, Found better price, etc."
              className="w-full border border-gray-300 rounded p-3 text-sm resize-none h-24"
              maxLength={500}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setCancellingOrder(null);
                  setCancellationReason("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => cancelOrder(cancellingOrder)}
                disabled={!cancellationReason.trim() || cancellingOrder}
                className={`flex-1 bg-red-600 text-white py-2 rounded text-sm ${
                  !cancellationReason.trim() || cancellingOrder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                }`}
              >
                {cancellingOrder ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No active orders found</p>
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
              <div key={order._id} className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
                {/* Order header with summary info */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order._id?.substring(0, 7)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        order.status === 'Order Placed' ? 'bg-green-500' : 
                        order.status === 'Packing' ? 'bg-blue-500' : 
                        order.status === 'Shipped' ? 'bg-yellow-500' : 
                        order.status === 'Out for delivery' ? 'bg-orange-500' : 
                        order.status === 'Delivered' ? 'bg-green-600' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium">{order.status}</span>
                    </div>
                  </div>
                
                </div>
                
                {/* Order items */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => {
                    const itemData = getItemDisplayData(item);
                    
                    return (
                      <div key={index} className="flex flex-col gap-6 p-6 transition-all duration-200 hover:bg-gray-50 md:flex-row md:items-start">
                        {/* Image Section */}
                        <div className="flex-shrink-0 flex justify-center md:justify-start">
                          <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center overflow-hidden">
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
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    {/* Payment Method */}
                    <div className="text-sm">
                      <p className="font-medium">
                        Payment Method: <span className="capitalize ml-1">{order.paymentMethod}</span>
                      </p>
                    </div>
                    
                    {/* Price Summary */}
                    <div className="flex flex-col gap-2 text-sm min-w-[200px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="font-medium">{currency}{subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery Fee:</span>
                        <span className="font-medium">
                          {order.deliveryCharges === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `${currency}${order.deliveryCharges.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-gray-700 font-semibold">Total:</span>
                        <span className="text-gray-900 font-bold">{currency}{total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isCancellable && cancellationTimeLeft > 0 && (
                        <button 
                          onClick={() => setCancellingOrder(order._id)}
                          className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 whitespace-nowrap flex items-center gap-2"
                        >
                          <span>Cancel Order</span>
                          {/* <span className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded">
                            {formatTime(cancellationTimeLeft)}
                          </span> */}
                        </button>
                      )}
                      
                      {order.status === "Order Placed" && cancellationTimeLeft <= 0 && (
                        <>
                        </>
                      )}
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