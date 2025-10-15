import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

/**
 * 📈 1️⃣ SALES TREND API
 * - Returns total sales and profit over time (daily, weekly, or monthly)
 */
export const getSalesTrend = async (req, res) => {
  try {
    const { period = "monthly" } = req.query; // daily | weekly | monthly
    const orders = await Order.find();

    if (!orders.length) return res.json({ trend: [] });

    // Group sales by period
    const grouped = {};

    orders.forEach(order => {
      const date = new Date(order.date);
      let key;

      if (period === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
      } else {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
      }

      if (!grouped[key]) {
        grouped[key] = { sales: 0, profit: 0 };
      }
      grouped[key].sales += order.amount || 0;
      grouped[key].profit += (order.amount || 0) - (order.cost || 0);
    });

    const trend = Object.entries(grouped).map(([period, values]) => ({
      period,
      ...values
    }));

    res.json({ trend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating sales trend" });
  }
};


/**
 * 👥 2️⃣ CUSTOMER INSIGHTS API
 * - Returns spending patterns, top customers, and repeat buyer rates
 */
export const getCustomerInsights = async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders.length) return res.json({ insights: {} });

    const customerStats = {};

    for (const order of orders) {
      const id = order.userId || "Unknown";
      if (!customerStats[id]) {
        customerStats[id] = {
          orders: 0,
          totalSpent: 0,
        };
      }
      customerStats[id].orders += 1;
      customerStats[id].totalSpent += order.amount || 0;
    }

    const allCustomers = Object.keys(customerStats).map(id => ({
      userId: id,
      orders: customerStats[id].orders,
      totalSpent: customerStats[id].totalSpent,
      avgOrderValue: (customerStats[id].totalSpent / customerStats[id].orders).toFixed(2)
    }));

    const topCustomers = allCustomers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
    const repeatBuyers = allCustomers.filter(c => c.orders > 1).length;
    const avgSpend = (
      allCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / allCustomers.length
    ).toFixed(2);

    res.json({
      insights: {
        totalCustomers: allCustomers.length,
        repeatBuyers,
        repeatRate: ((repeatBuyers / allCustomers.length) * 100).toFixed(2),
        avgSpend,
        topCustomers
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating customer insights" });
  }
};


/**
 * ⚠️ 3️⃣ ALERTS API
 * - Returns warnings for low stock, delayed orders, high-demand products
 */
export const getAlerts = async (req, res) => {
  try {
    const products = await Product.find();
    const orders = await Order.find();

    const lowStock = products.filter(p => p.quantity <= 5);
    const delayedOrders = orders.filter(o => {
      const orderDate = new Date(o.date);
      const daysPassed = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysPassed > 7 && o.status !== "Delivered"; // pending > 7 days
    });

    const highDemand = products.filter(p => (p.totalSales || 0) > 50);

    res.json({
      alerts: {
        lowStock: lowStock.map(p => ({ id: p._id, name: p.name, stock: p.quantity })),
        delayedOrders: delayedOrders.map(o => ({
          id: o._id,
          status: o.status,
          date: o.date,
          daysPending: Math.floor((Date.now() - new Date(o.date)) / (1000 * 60 * 60 * 24))
        })),
        highDemand: highDemand.map(p => ({
          id: p._id,
          name: p.name,
          totalSales: p.totalSales
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating alerts" });
  }
};
