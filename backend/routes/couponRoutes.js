import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateAndApplyCoupon,
  getAvailableCoupons,
} from "../controllers/couponController.js";
import adminAuth from "../middleware/adminAuth.js";

const couponRoutes = express.Router();

// Admin Routes (Protected)
couponRoutes.post("/create", adminAuth, createCoupon);
couponRoutes.get("/list", adminAuth, getAllCoupons);
couponRoutes.get("/detail/:id", adminAuth, getCouponById);
couponRoutes.put("/update/:id", adminAuth, updateCoupon);
couponRoutes.delete("/delete/:id", adminAuth, deleteCoupon);
couponRoutes.patch("/toggle-status/:id", adminAuth, toggleCouponStatus);

// Client / Public Routes
couponRoutes.post("/apply", validateAndApplyCoupon);
couponRoutes.get("/available", getAvailableCoupons);

export default couponRoutes;
