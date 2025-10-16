import express from 'express';
import {
  getDashboardStats,
  getSalesTrend,
  getAlerts,
  getCustomerAnalytics
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/sales-trend', getSalesTrend);
router.get('/alerts', getAlerts);
router.get('/customer-analytics', getCustomerAnalytics);

export default router;