import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const placeOrder = async (req, res) => {
  try {
    console.log("🛒 ========== BACKEND ORDER PLACEMENT ==========");
    console.log("📥 Received request body:", req.body);
    
    const { items, amount, address, deliveryCharges } = req.body; // ✅ Add deliveryCharges
    const userId = req.userId;

    console.log("🔍 Extracted data:", {
      userId,
      itemsCount: items?.length,
      amount,
      deliveryCharges, // ✅ Log delivery charges
      address: address ? "Present" : "Missing"
    });

    // Validate required fields
    if (!items || items.length === 0) {
      return res.json({ success: false, message: "No items in order" });
    }

    if (!amount || amount <= 0) {
      console.error("❌ Invalid amount received:", amount);
      return res.json({ success: false, message: "Invalid order amount" });
    }

    if (!address) {
      return res.json({ success: false, message: "Address is required" });
    }

    const orderData = {
      userId,
      items,
      amount: Number(amount),
      address,
      deliveryCharges: deliveryCharges || 0, // ✅ Include delivery charges with default
      paymentMethod: "COD",
      payment: false,
      status: "Order Placed",
      date: Date.now(),
    };

    console.log("💾 Saving order data with delivery charges:", orderData.deliveryCharges);

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    console.log("✅ Order saved successfully with delivery charges:", newOrder.deliveryCharges);

    // Clear user cart after placing order
    await userModel.findByIdAndUpdate(userId, { 
      cartData: {},
      cartDeals: {} 
    });

    console.log("🛒 User cart cleared");

    res.json({ 
      success: true, 
      message: "Order Placed Successfully", 
      orderId: newOrder._id,
      deliveryCharges: newOrder.deliveryCharges // ✅ Return delivery charges in response
    });

  } catch (error) {
    console.error("❌ Error in placeOrder:", error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error("Validation errors:", validationErrors);
      return res.json({ 
        success: false, 
        message: `Validation failed: ${validationErrors.join(', ')}` 
      });
    }
    
    res.json({ success: false, message: error.message });
  }
};

// 📋 Get All Orders (Admin Panel)
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    console.log(`📦 Found ${orders.length} orders with delivery charges`);
    
    // Log delivery charges for debugging
    orders.forEach(order => {
      console.log(`Order ${order._id}: Delivery Charges = ${order.deliveryCharges}`);
    });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error in allOrders:", error);
    res.json({ success: false, message: error.message });
  }
};

// 👤 Get Logged-in User Orders
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    
    console.log(`📦 Found ${orders.length} orders for user ${userId}`);
    
    // Log delivery charges for debugging
    orders.forEach(order => {
      console.log(`Order ${order._id}: Amount = ${order.amount}, Delivery Charges = ${order.deliveryCharges}`);
    });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error in userOrders:", error);
    res.json({ success: false, message: error.message });
  }
};

// 🔄 Update Order Status (Admin Panel)
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.json({ success: false, message: "Order ID and status are required" });
    }

    await orderModel.findByIdAndUpdate(orderId, { status, updatedAt: Date.now() });
    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error("❌ Error in updateStatus:", error);
    res.json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId, cancellationReason } = req.body;
    const userId = req.userId;

    console.log("❌ Cancelling order:", { orderId, userId, cancellationReason });

    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    // Find the order
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Check if user owns this order
    if (order.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized to cancel this order" });
    }

    // Check if order can be cancelled (only orders that are not shipped/delivered)
    const nonCancellableStatuses = ["Shipped", "Out for delivery", "Delivered", "Cancelled"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.json({ 
        success: false, 
        message: `Order cannot be cancelled as it is already ${order.status.toLowerCase()}` 
      });
    }

    // Update order status and cancellation details
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { 
        status: "Cancelled",
        cancellationReason: cancellationReason || "No reason provided",
        cancelledAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log("✅ Order cancelled successfully:", updatedOrder._id);

    res.json({ 
      success: true, 
      message: "Order cancelled successfully",
      order: updatedOrder 
    });

  } catch (error) {
    console.error("❌ Error in cancelOrder:", error);
    res.json({ success: false, message: error.message });
  }
};

export { placeOrder, allOrders, userOrders, updateStatus, cancelOrder };
