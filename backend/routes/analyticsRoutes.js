import express from "express";
import {
  getSalesTrend,
  getCustomerInsights,
  getAlerts
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/sales-trend", getSalesTrend);
router.get("/customer-insights", getCustomerInsights);
router.get("/alerts", getAlerts);

export default router;
