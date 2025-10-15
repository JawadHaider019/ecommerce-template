import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const orders = await Order.find().populate('items.productId');

    // ✅ Total Revenue (sum of all order.amount)
    const totalRevenue = orders.reduce((acc, order) => acc + (order.amount || 0), 0);

    // ✅ Total Cost (sum of item.cost * item.quantity for all orders)
    const totalCost = orders.reduce((acc, order) => {
      const costPerOrder = order.items.reduce((sum, item) => {
        const cost = item.cost || (item.productId?.cost || 0);
        const qty = item.quantity || 1;
        return sum + cost * qty;
      }, 0);
      return acc + costPerOrder;
    }, 0);

    // ✅ Profit and margin
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue
      ? ((totalProfit / totalRevenue) * 100).toFixed(2)
      : 0;

    // ✅ Total items sold
    const totalItemsSold = orders.reduce((acc, order) => {
      return acc + order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }, 0);

    // ✅ Average order value
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // ✅ Pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    // ✅ Recent Orders (5 latest by date)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('items.productId', 'name price cost');

    // ✅ Top Products (by total sales quantity)
    const topProducts = await Product.find()
      .sort({ totalSales: -1 })
      .limit(5);

    // ✅ Low Stock Products (quantity < 5)
    const lowStockProducts = await Product.find({ quantity: { $lt: 5 } });

    // ✅ Total stock value (sum of cost * quantity for all products)
    const totalStockValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$cost", "$quantity"] } },
        },
      },
    ]);

    // Calculate product categories count
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate out of stock products
    const outOfStock = await Product.countDocuments({ quantity: 0 });

    res.status(200).json({
      stats: {
        totalOrders,
        totalProducts,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin: parseFloat(profitMargin),
        totalStockValue: totalStockValue[0]?.totalValue || 0,
        totalItemsSold,
        averageOrderValue: Math.round(averageOrderValue),
        pendingOrders,
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        amount: order.amount,
        status: order.status,
        date: order.createdAt,
        shippingAddress: order.shippingAddress,
        items: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          cost: item.cost || (item.productId?.cost || 0),
          price: item.price || (item.productId?.price || 0)
        }))
      })),
      topProducts: topProducts.map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        discountprice: product.discountprice,
        cost: product.cost,
        quantity: product.quantity,
        totalSales: product.totalSales || 0,
        status: product.status
      })),
      lowStockProducts: lowStockProducts.map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        cost: product.cost,
        price: product.price,
        status: product.status
      })),
      inventorySummary: {
        totalItems: totalProducts,
        totalValue: totalStockValue[0]?.totalValue || 0,
        categories: categories.length,
        outOfStock,
        lowStock: lowStockProducts.length
      }
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

// Additional analytics APIs
export const getSalesTrend = async (req, res) => {
  try {
    const { period = "monthly" } = req.query;
    
    let groupFormat;
    switch (period) {
      case "daily":
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "weekly":
        groupFormat = { 
          $concat: [
            { $toString: { $isoWeek: "$createdAt" } },
            "-",
            { $toString: { $isoWeekYear: "$createdAt" } }
          ]
        };
        break;
      default: // monthly
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }

    const salesTrend = await Order.aggregate([
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 },
          itemsSold: { $sum: { $size: "$items" } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Transform data for frontend
    const trend = salesTrend.map(item => ({
      period: item._id,
      sales: item.orders,
      revenue: item.revenue,
      cost: item.revenue * 0.6, // Estimated cost (60% of revenue)
      profit: item.revenue * 0.4 // Estimated profit (40% of revenue)
    }));

    res.json({ trend });
  } catch (error) {
    console.error("Sales Trend Error:", error);
    res.status(500).json({ message: "Error fetching sales trend" });
  }
};

export const getCustomerInsights = async (req, res) => {
  try {
    const customerStats = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$amount" },
          orders: { $sum: 1 },
          firstOrder: { $min: "$createdAt" },
          lastOrder: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    const totalCustomers = customerStats.length;
    const repeatBuyers = customerStats.filter(c => c.orders > 1).length;
    const totalRevenue = customerStats.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpend = totalCustomers ? totalRevenue / totalCustomers : 0;

    const topCustomers = customerStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(customer => ({
        name: customer.userInfo?.name || 'Unknown Customer',
        totalSpent: customer.totalSpent,
        orders: customer.orders,
        lastPurchase: customer.lastOrder,
        clv: customer.totalSpent * 1.25 // Simple CLV calculation
      }));

    res.json({
      insights: {
        totalCustomers,
        repeatBuyers,
        repeatRate: totalCustomers ? ((repeatBuyers / totalCustomers) * 100).toFixed(2) : 0,
        avgSpend: avgSpend.toFixed(2),
        customerLifetimeValue: (avgSpend * 1.25).toFixed(2),
        topCustomers,
        newVsReturning: {
          new: Math.round(totalCustomers * 0.42), // Placeholder
          returning: Math.round(totalCustomers * 0.58) // Placeholder
        },
        customerGrowth: [120, 135, 142, 156, 168, 175] // Placeholder growth data
      }
    });
  } catch (error) {
    console.error("Customer Insights Error:", error);
    res.status(500).json({ message: "Error fetching customer insights" });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ quantity: { $lt: 5 } });
    
    const delayedOrders = await Order.find({
      status: { $in: ['Pending', 'Processing'] },
      createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Older than 7 days
    });

    const outOfStockProducts = await Product.find({ quantity: 0 });

    res.json({
      alerts: {
        lowStock: lowStockProducts.map(product => ({
          _id: product._id,
          name: product.name,
          stock: product.quantity,
          category: product.category
        })),
        delayedOrders: delayedOrders.map(order => ({
          _id: order._id,
          status: order.status,
          date: order.createdAt,
          daysPending: Math.floor((Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24))
        })),
        outOfStock: outOfStockProducts.map(product => ({
          _id: product._id,
          name: product.name,
          category: product.category
        }))
      }
    });
  } catch (error) {
    console.error("Alerts Error:", error);
    res.status(500).json({ message: "Error fetching alerts" });
  }
};