import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';

const Orders = ({ token, setToken }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Central unauthorized handler
  const handleUnauthorized = (endpoint) => {
    console.error(
      `❌ Unauthorized (401) while calling ${endpoint}. Token:`,
      token ? token.substring(0, 15) + '...' : 'EMPTY'
    );
    toast.error('Not Authorized Login Again');
    setToken('');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Fetch all orders
  const fetchAllOrders = async () => {
    if (!token) {
      handleUnauthorized('/api/order/list');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        console.warn('⚠️ Failed to fetch orders:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized('/api/order/list');
      } else {
        console.error('💥 Error fetching orders:', error);
        toast.error(error.response?.data?.message || error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const statusHandler = async (event, orderId) => {
    if (!token) {
      handleUnauthorized('/api/order/status');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Status updated successfully');
        fetchAllOrders(); // Refresh orders
      } else {
        console.warn('⚠️ Failed to update status:', response.data.message);
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized('/api/order/status');
      } else {
        console.error('💥 Error updating status:', error);
        toast.error(error.response?.data?.message || error.message || 'An error occurred');
      }
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-left">Order Management</h3>

        {orders.length === 0 ? (
          <div className="text-center py-2">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <img src={assets.parcel_icon} alt="No orders" className="opacity-50" />
            </div>
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = order.items || [];
              const subtotal = items.reduce(
                (sum, item) => sum + item.discountprice * item.quantity,
                0
              );
              const total = subtotal + (order.deliveryCharges || 0);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center">
                        <img
                          src={assets.parcel_icon}
                          alt="Parcel icon"
                          className="h-8 w-8 mr-3"
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            Order #{order._id.substring(0, 7)}
                          </h4>
                          <p className="text-sm text-gray-500">ID: {order._id}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end mt-2 sm:mt-0">
                        <span className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Items */}
                      <div className="lg:col-span-1">
                        <div className="mb-6">
                          <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                            Order Items ({items.length})
                          </h5>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                            {items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {currency}
                                    {(item.discountprice * item.quantity).toFixed(2)}
                                  </p>
                                  <p className="text-xs line-through text-gray-400">
                                    {currency}
                                    {(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Address & Payment */}
                      <div className="lg:col-span-1">
                        <div className="mb-6">
                          <h5 className="text-md font-medium text-gray-700 mb-3">
                            Delivery Address
                          </h5>
                          <div className="bg-gray-50 rounded-lg p-4 text-sm">
                            <p className="font-medium">
                              {order.address.firstName} {order.address.lastName}
                            </p>
                            <p className="text-gray-600">{order.address.street},</p>
                            <p className="text-gray-600">
                              {order.address.city}, {order.address.state},{' '}
                              {order.address.country}
                            </p>
                            <p className="text-gray-600">{order.address.zipcode}</p>
                            <p className="text-gray-600 mt-2">
                              📞 {order.address.phone}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h5 className="text-md font-medium text-gray-700 mb-3">
                            Payment Information
                          </h5>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium capitalize">
                                  {order.paymentMethod}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span
                                  className={`font-medium ${
                                    order.payment ? 'text-green-600' : 'text-yellow-600'
                                  }`}
                                >
                                  {order.payment ? 'Completed' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary & Status */}
                      <div className="lg:col-span-1">
                        <div className="mb-6">
                          <h5 className="text-md font-medium text-gray-700 mb-3">
                            Order Summary
                          </h5>
                          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">
                                  {currency}
                                  {subtotal.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee:</span>
                                <span className="font-medium">
                                  {currency}
                                  {(order.deliveryCharges || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-green-200 flex justify-between font-semibold">
                                <span className="text-gray-700">Total Amount:</span>
                                <span className="text-green-700">
                                  {currency}
                                  {total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-md font-medium text-gray-700 mb-3">
                            Update Status
                          </h5>
                          <select
                            onChange={(event) => statusHandler(event, order._id)}
                            value={order.status}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packing">Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
