import express from "express";
import {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/sales", getSalesReport);
router.get("/inventory", getInventoryReport);
router.get("/customers", getCustomerReport);

export default router;
