import express from "express"
import { 
  placeOrder, 
  placeOrderWithPayment, // 🆕 NEW
  verifyPayment, // 🆕 NEW
  getPendingPaymentOrders, // 🆕 NEW
  allOrders, 
  userOrders, 
  updateStatus, 
  cancelOrder,
  getCancellationReasons,
  checkStock,
  getUserNotifications,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getOrderDetails
} from "../controllers/orderController.js"
import { authUser } from "../middleware/auth.js"
import adminAuth from "../middleware/adminAuth.js"
import upload from "../middleware/multer.js" // 🆕 Make sure you have file upload middleware

const orderRoutes = express.Router()

// Admin routes
orderRoutes.get("/list", adminAuth, allOrders)
orderRoutes.post("/status", adminAuth, updateStatus)

// 🆕 PAYMENT VERIFICATION ROUTES (Admin)
orderRoutes.get("/pending-payments", adminAuth, getPendingPaymentOrders) // Get orders with pending payments
orderRoutes.post("/verify-payment", adminAuth, verifyPayment) // Verify/reject payment

// Payment routes
orderRoutes.post("/place", authUser, placeOrder)
orderRoutes.post("/place-with-payment", authUser, upload.single('payment_screenshot'), placeOrderWithPayment)

// User orders
orderRoutes.post("/userorders", authUser, userOrders)
orderRoutes.post("/cancel", authUser, cancelOrder)
orderRoutes.get("/:orderId", authUser, getOrderDetails)

// Cancellation reasons
orderRoutes.get("/cancellation-reasons", getCancellationReasons)

// Stock check
orderRoutes.post("/check-stock", authUser, checkStock)

// 🆕 NOTIFICATION ROUTES
orderRoutes.get("/notifications", authUser, getUserNotifications)
orderRoutes.get("/admin/notifications", adminAuth, getAdminNotifications)
orderRoutes.post("/notifications/mark-read", authUser, markNotificationAsRead)
orderRoutes.post("/notifications/mark-all-read", authUser, markAllNotificationsAsRead)

export default orderRoutes