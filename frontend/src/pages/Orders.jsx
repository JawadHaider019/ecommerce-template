import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from '../components/Title';
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

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
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No orders found</p>
        ) : (
          orders.map((order) => {
            // Calculate the subtotal (sum of all items' discounted prices)
            const subtotal = order.items.reduce((sum, item) => {
              return sum + (item.discountprice * item.quantity);
            }, 0);
            
            // Calculate delivery fee per item (for display only)
            const deliveryFeePerItem = order.deliveryCharges ? (order.deliveryCharges / order.items.length) : 0;
            
            // Calculate total (should match order.totalAmount)
            const total = subtotal + (order.deliveryCharges || 0);
            
            return (
              <div key={order._id} className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
                {/* Order header with summary info */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order._id.substring(0, 7)}</p>
                      <p className="text-sm text-gray-500">{new Date(order.date).toDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        order.status === 'Order Placed' ? 'bg-green-500' : 
                        order.status === 'Packing' ? 'bg-blue-100' : 
                        order.status === 'Shipped' ? 'bg-yellow-500' : 
                        order.status === 'Out for delivery' ? 'bg-red-500' : 
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium">{order.status}</span>
                    </div>
                  </div>
                </div>
                
                {/* Order items */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex flex-col gap-6 p-6 transition-all duration-200 hover:bg-gray-50 md:flex-row md:items-start">
                      {/* Image Section */}
                      <div className="flex-shrink-0 flex justify-center md:justify-start">
                        <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center overflow-hidden">
                          <img 
                            className="w-full h-full object-contain p-2" 
                            src={item.image[0]} 
                            alt={item.name} 
                          />
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg mb-3">{item.name}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Original Price</span>
                            <span className="line-through text-gray-400">{currency}{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Discounted Price</span>
                            <span className="font-medium text-gray-900">{currency}{(item.discountprice * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Quantity</span>
                            <span className="font-medium text-green-600">{item.quantity}</span>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order footer with actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    {/* Payment Method */}
                    <div className="text-sm">
                      <p className="font-medium">Payment Method: <span className="capitalize ml-1">{order.paymentMethod}</span></p>
                    </div>
                    
                    {/* Price Summary */}
                    <div className="flex flex-row items-end gap-2 text-sm">
                      <div className="flex gap-2 w-48">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="font-medium">{currency}{subtotal}</span>
                      </div>
                      
                      <div className="flex gap-2 w-48">
                        <span className="text-gray-500">Delivery Fee:</span>
                        <span className="font-medium">{currency}{(order.deliveryCharges || 0)}</span>
                      </div>
                      
                      <div className="flex gap-2 w-48">
                        <span className="text-gray-700 font-semibold">Total:</span>
                        <span className="text-gray-900 font-bold">{currency}{total}</span>
                      </div>
                    </div>
                    
                    {/* Track Order Button */}
                    <button 
                      onClick={loadOrderData} 
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 whitespace-nowrap"
                    >
                      Track Order
                    </button>
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