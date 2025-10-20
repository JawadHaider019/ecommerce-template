import express from "express"
import { placeOrder,allOrders,userOrders,updateStatus,cancelOrder ,getCancellationReasons } from "../controllers/orderController.js"
import { authUser } from "../middleware/auth.js"
import  adminAuth  from "../middleware/adminAuth.js"

const orderRoutes = express.Router()
//admin
orderRoutes.get("/list",adminAuth, allOrders)
orderRoutes.post("/status",adminAuth, updateStatus)
//payment
orderRoutes.post("/place",authUser, placeOrder)
//user orders
orderRoutes.post("/userorders",authUser, userOrders)

orderRoutes.post("/cancel", authUser, cancelOrder)
orderRoutes.get("/cancellation-reasons", getCancellationReasons);

export default orderRoutes;