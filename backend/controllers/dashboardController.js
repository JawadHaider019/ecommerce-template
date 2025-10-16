import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Deal from "../models/dealModel.js";
import User from "../models/userModel.js";

/**
 * MAIN DASHBOARD STATS CONTROLLER - FIXED DEAL CALCULATIONS
 */
export const getDashboardStats = async (req, res) => {
  try {
    console.log('=== DASHBOARD STATS API CALLED ===');
    
    const { timeRange = 'monthly' } = req.query;
    const dateRange = getDateRange(timeRange);
    const startTimestamp = dateRange.start.getTime();
    const endTimestamp = dateRange.end.getTime();

    // Debug: Check what data exists
    const allProducts = await Product.find({});
    const allOrders = await Order.find({ date: { $gte: startTimestamp, $lte: endTimestamp } });
    const allUsers = await User.find({});
    const allDeals = await Deal.find({});

    console.log('DEBUG DATA:');
    console.log('- Products:', allProducts.length);
    console.log('- Orders in period:', allOrders.length);
    console.log('- Users:', allUsers.length);
    console.log('- Deals:', allDeals.length);

    // 1️⃣ BASIC COUNTS
    const totalOrders = allOrders.length;
    const totalProducts = allProducts.length;
    const totalDeals = allDeals.length;

    // 2️⃣ REVENUE CALCULATION
    const totalProductRevenue = allOrders.reduce((acc, order) => acc + (order.amount || 0), 0);

    // 3️⃣ COST CALCULATION - IMPROVED
    let totalProductCost = 0;
    let totalItemsSold = 0;

    for (const order of allOrders) {
      for (const item of order.items) {
        totalItemsSold += item.quantity || 1;
        
        if (item.cost) {
          // If cost is directly in order item
          totalProductCost += item.cost * (item.quantity || 1);
        } else if (item.productId) {
          // If we have productId, try to get cost from product
          const product = await Product.findById(item.productId);
          if (product) {
            totalProductCost += product.cost * (item.quantity || 1);
          } else {
            // Fallback: estimate cost as 60% of price
            const estimatedCost = (item.price || order.amount / (item.quantity || 1)) * 0.6;
            totalProductCost += estimatedCost * (item.quantity || 1);
          }
        } else {
          // Final fallback: estimate cost as 60% of revenue
          totalProductCost += order.amount * 0.6;
          break; // Avoid double counting
        }
      }
    }

    // 4️⃣ PROFIT CALCULATIONS
    const totalProductProfit = totalProductRevenue - totalProductCost;
    const profitMargin = totalProductRevenue > 0 ? ((totalProductProfit / totalProductRevenue) * 100) : 0;

    // 5️⃣ PENDING ORDERS
    const pendingOrders = allOrders.filter(order => 
      ["Order Placed", "Packing", "Processing"].includes(order.status)
    ).length;

    // 6️⃣ INVENTORY VALUE
    const inventoryValue = allProducts.reduce((acc, product) => {
      return acc + (product.cost * product.quantity);
    }, 0);

    // 7️⃣ RECENT ORDERS (last 6) - FIXED PRODUCT NAMES
    const recentOrders = await Order.find()
      .sort({ date: -1 })
      .limit(6);

    const enhancedRecentOrders = await Promise.all(
      recentOrders.map(async (order) => {
        const user = await User.findById(order.userId);
        
        const orderItems = await Promise.all(
          order.items.map(async (item, index) => {
            // Try multiple ways to find product name
            if (item.productId) {
              const product = await Product.findById(item.productId);
              return {
                name: product?.name || `Product ${item.productId}`,
                quantity: item.quantity || 1
              };
            } else if (item.name && item.name !== 'Generic Item') {
              // If item already has a name
              return {
                name: item.name,
                quantity: item.quantity || 1
              };
            } else {
              // Try to find product by price matching
              const avgPricePerItem = order.amount / order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
              const possibleProducts = await Product.find({
                price: { $gte: avgPricePerItem * 0.7, $lte: avgPricePerItem * 1.3 }
              }).limit(1);
              
              if (possibleProducts.length > 0) {
                return {
                  name: possibleProducts[0].name,
                  quantity: item.quantity || 1
                };
              }
              
              // Final fallback with better naming
              return {
                name: `Item ${index + 1}`,
                quantity: item.quantity || 1
              };
            }
          })
        );

        return {
          _id: order._id,
          user: {
            name: user?.name || 'Unknown Customer',
            location: order.address?.city || 'Unknown'
          },
          amount: order.amount,
          status: order.status,
          createdAt: new Date(order.date).toISOString(),
          items: orderItems
        };
      })
    );

    // 8️⃣ TOP PRODUCTS - FIXED
    const topProducts = allProducts
      .sort((a, b) => (b.totalSales || b.quantity) - (a.totalSales || a.quantity))
      .slice(0, 6)
      .map(product => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        quantity: product.quantity,
        totalSales: product.totalSales || Math.floor(product.quantity * 0.8),
        discountprice: product.discountprice
      }));

    // 9️⃣ LOW STOCK PRODUCTS - FIXED THRESHOLD
    const lowStockProducts = allProducts
      .filter(product => product.quantity < 15 && product.quantity > 0)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5)
      .map(product => ({
        _id: product._id,
        name: product.name,
        quantity: product.quantity,
        cost: product.cost,
        idealStock: 20,
        category: product.category,
        price: product.price
      }));

    // 🔟 CUSTOMER INSIGHTS - FIXED
    const totalCustomers = allUsers.length;
    
    const customerOrders = await Order.aggregate([
      { 
        $match: { 
          date: { $gte: startTimestamp, $lte: endTimestamp } 
        } 
      },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$amount" }
        }
      }
    ]);

    const repeatBuyers = customerOrders.filter(customer => customer.orderCount > 1).length;
    const newCustomers = Math.max(0, totalCustomers - repeatBuyers);
    const repeatRate = totalCustomers > 0 ? (repeatBuyers / totalCustomers) * 100 : 0;

    // Top customers
    const topCustomersData = await Promise.all(
      customerOrders
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 3)
        .map(async (customer) => {
          const user = await User.findById(customer._id);
          return {
            name: user?.name || 'Unknown Customer',
            totalSpent: customer.totalSpent,
            orders: customer.orderCount
          };
        })
    );

    // 1️⃣1️⃣ DEAL ANALYTICS - COMPLETELY REWRITTEN WITH REAL DATA
    const now = new Date();
    console.log('Current time for deal check:', now);

    // Calculate deal metrics from actual orders
    let totalDealRevenue = 0;
    let totalDealCost = 0;
    let totalDealsSold = 0;
    
    // Track individual deal performance
    const dealPerformanceMap = new Map();
    
    // Analyze each order to find deal-related purchases
    for (const order of allOrders) {
      // Check if order has deal information or if items are part of deals
      if (order.dealId || order.items.some(item => item.dealId)) {
        const dealId = order.dealId || order.items[0]?.dealId;
        const deal = await Deal.findById(dealId);
        
        if (deal) {
          totalDealRevenue += order.amount;
          totalDealsSold += 1;
          
          // Calculate deal cost based on deal products
          let orderDealCost = 0;
          if (deal.dealProducts && deal.dealProducts.length > 0) {
            orderDealCost = deal.dealProducts.reduce((sum, product) => {
              const productCost = product.cost || (product.price * 0.6);
              return sum + (productCost * (product.quantity || 1));
            }, 0);
          } else {
            // Estimate cost if no deal products defined
            orderDealCost = order.amount * 0.6;
          }
          
          totalDealCost += orderDealCost;
          
          // Track individual deal performance
          if (!dealPerformanceMap.has(dealId.toString())) {
            dealPerformanceMap.set(dealId.toString(), {
              deal,
              revenue: 0,
              cost: 0,
              sales: 0
            });
          }
          
          const dealPerformance = dealPerformanceMap.get(dealId.toString());
          dealPerformance.revenue += order.amount;
          dealPerformance.cost += orderDealCost;
          dealPerformance.sales += 1;
        }
      }
    }

    // Calculate deal profit
    const totalDealProfit = totalDealRevenue - totalDealCost;
    const dealProfitMargin = totalDealRevenue > 0 ? ((totalDealProfit / totalDealRevenue) * 100) : 0;

    // Calculate active deals
    const activeDeals = allDeals.filter(deal => {
      if (deal.status !== "published") return false;
      const startDate = new Date(deal.dealStartDate);
      const endDate = new Date(deal.dealEndDate);
      return startDate <= now && endDate >= now;
    }).length;

    // Calculate average deal discount
    const avgDealDiscount = allDeals.length > 0 ? 
      allDeals.reduce((sum, deal) => sum + (deal.dealDiscountValue || 0), 0) / allDeals.length : 0;

    // Calculate deal inventory value
    const dealInventoryValue = allDeals.reduce((acc, deal) => {
      const dealValue = (deal.dealProducts || []).reduce((sum, product) => {
        return sum + ((product.cost || 0) * (product.quantity || 0));
      }, 0);
      return acc + dealValue;
    }, 0);

    // Updated deal stats with real calculations
    const dealStats = {
      totalDeals: allDeals.length,
      activeDeals,
      totalDealRevenue: parseFloat(totalDealRevenue.toFixed(2)),
      totalDealCost: parseFloat(totalDealCost.toFixed(2)),
      totalDealProfit: parseFloat(totalDealProfit.toFixed(2)),
      dealProfitMargin: parseFloat(dealProfitMargin.toFixed(2)),
      avgDealDiscount: parseFloat(avgDealDiscount.toFixed(2)),
      dealsSold: totalDealsSold,
      dealInventoryValue: parseFloat(dealInventoryValue.toFixed(2))
    };

    // Top deals - based on actual performance data
    const topDeals = Array.from(dealPerformanceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4)
      .map(performance => {
        const deal = performance.deal;
        const startDate = new Date(deal.dealStartDate);
        const endDate = new Date(deal.dealEndDate);
        const isActive = deal.status === "published" && startDate <= now && endDate >= now;
        
        return {
          _id: deal._id,
          name: deal.dealName,
          type: deal.dealType,
          discountType: deal.dealDiscountType,
          discountValue: deal.dealDiscountValue,
          status: deal.status,
          isActive,
          views: deal.views || 0,
          clicks: deal.clicks || 0,
          revenue: performance.revenue,
          totalSales: performance.sales,
          startDate: deal.dealStartDate,
          endDate: deal.dealEndDate
        };
      });

    // If no deal performance data, show all deals sorted by creation date
    if (topDeals.length === 0) {
      const allDealsSorted = allDeals
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
        .map(deal => {
          const startDate = new Date(deal.dealStartDate);
          const endDate = new Date(deal.dealEndDate);
          const isActive = deal.status === "published" && startDate <= now && endDate >= now;
          
          return {
            _id: deal._id,
            name: deal.dealName,
            type: deal.dealType,
            discountType: deal.dealDiscountType,
            discountValue: deal.dealDiscountValue,
            status: deal.status,
            isActive,
            views: deal.views || 0,
            clicks: deal.clicks || 0,
            revenue: 0,
            totalSales: 0,
            startDate: deal.dealStartDate,
            endDate: deal.dealEndDate
          };
        });
      
      topDeals.push(...allDealsSorted);
    }

    console.log('Top deals with real data:');
    topDeals.forEach(deal => {
      console.log(`- ${deal.name}: Revenue=${deal.revenue}, Sales=${deal.totalSales}, Active=${deal.isActive}`);
    });

    // Deal performance by type
    const dealPerformance = allDeals.reduce((acc, deal) => {
      const type = deal.dealType || 'other';
      const performance = dealPerformanceMap.get(deal._id.toString());
      
      if (performance) {
        const existing = acc.find(item => item.type === type);
        if (existing) {
          existing.count++;
          existing.totalViews += deal.views || 0;
          existing.totalClicks += deal.clicks || 0;
          existing.totalProductRevenue += performance.revenue;
        } else {
          acc.push({
            type: type,
            count: 1,
            totalViews: deal.views || 0,
            totalClicks: deal.clicks || 0,
            totalProductRevenue: performance.revenue,
            avgDiscount: deal.dealDiscountValue || 0
          });
        }
      }
      return acc;
    }, []);

    // 1️⃣2️⃣ ALERTS - FIXED
    const alerts = [
      ...lowStockProducts.map(product => ({
        id: product._id.toString(),
        type: 'stock',
        title: product.quantity <= 2 ? 'Critical Stock Alert' : 'Low Stock Alert',
        message: `${product.name} is running ${product.quantity <= 2 ? 'very low' : 'low'} (${product.quantity} left)`,
        priority: product.quantity <= 2 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        read: false
      })),
      ...allOrders
        .filter(order => order.amount > 2000)
        .slice(0, 2)
        .map(order => ({
          id: order._id.toString(),
          type: 'order',
          title: 'High Value Order',
          message: `Order #${order._id} - Rs ${order.amount.toLocaleString()}`,
          priority: 'medium',
          timestamp: new Date(order.date).toISOString(),
          read: false
        }))
    ];

    console.log('=== FINAL STATS ===');
    console.log('Total Products:', totalProducts);
    console.log('Total Product Revenue:', totalProductRevenue);
    console.log('Total Product Cost:', totalProductCost);
    console.log('Total Product Profit:', totalProductProfit);
    console.log('Active Deals:', activeDeals);
    console.log('Deal Revenue (from orders):', totalDealRevenue);
    console.log('Deal Cost:', totalDealCost);
    console.log('Deal Profit:', totalDealProfit);
    console.log('Deals Sold:', totalDealsSold);

    // ✅ FINAL RESPONSE - UPDATED WITH REAL DEAL DATA
    res.status(200).json({
      stats: {
        totalOrders,
        totalProductRevenue,
        totalProducts,
        pendingOrders,
        totalProductProfit: parseFloat(totalProductProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        totalProductCost: parseFloat(totalProductCost.toFixed(2)),
        totalItemsSold,
        inventoryValue: parseFloat(inventoryValue.toFixed(2)),
        ...dealStats
      },
      recentOrders: enhancedRecentOrders,
      topProducts,
      lowStockProducts,
      customerInsights: {
        totalCustomers,
        repeatBuyers,
        repeatRate: parseFloat(repeatRate.toFixed(1)),
        newCustomers,
        topCustomers: topCustomersData
      },
      dealData: {
        topDeals,
        dealPerformance,
        dealStats
      },
      alerts,
      timeRange
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ 
      message: "Error fetching dashboard data",
      error: error.message 
    });
  }
};

/**
 * SALES TREND CONTROLLER
 */
export const getSalesTrend = async (req, res) => {
  try {
    const { period = "6months", type = "revenue" } = req.query;

    let months = 6;
    if (period === '3months') months = 3;
    if (period === '12months') months = 12;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const allOrders = await Order.find({
      date: { $gte: startTimestamp, $lte: endTimestamp }
    });

    const monthlyData = [];
    const currentDate = new Date(startDate);
    
    currentDate.setDate(1);
    
    while (currentDate <= endDate) {
      const monthKey = currentDate.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).getTime();

      const monthlyOrders = allOrders.filter(order => 
        order.date >= monthStart && order.date <= monthEnd
      );

      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.amount, 0);
      const monthlyProfit = monthlyRevenue * 0.4;
      const monthlyCost = monthlyRevenue * 0.6;

      monthlyData.push({
        period: monthKey,
        revenue: monthlyRevenue,
        profit: monthlyProfit,
        cost: monthlyCost,
        orders: monthlyOrders.length
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({ 
      trend: monthlyData,
      period,
      type 
    });
  } catch (error) {
    console.error("Sales Trend Error:", error);
    res.status(500).json({ message: "Error fetching sales trend" });
  }
};

/**
 * ALERTS CONTROLLER
 */
export const getAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ 
      quantity: { $lt: 15, $gt: 0 }
    }).select("name quantity category cost");

    const outOfStockProducts = await Product.find({ 
      quantity: 0
    }).select("name category");

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const highValueOrders = await Order.find({
      amount: { $gt: 1000 },
      date: { $gte: oneWeekAgo }
    }).select("_id amount date");

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringDeals = await Deal.find({
      status: "published",
      dealEndDate: { 
        $lte: sevenDaysFromNow,
        $gte: new Date() 
      }
    }).select("dealName dealEndDate");

    const alerts = [
      ...lowStockProducts.map(product => ({
        id: product._id.toString(),
        type: 'stock',
        title: product.quantity <= 2 ? 'Critical Stock Alert' : 'Low Stock Alert',
        message: `${product.name} is running ${product.quantity <= 2 ? 'very low' : 'low'} (${product.quantity} left)`,
        priority: product.quantity <= 2 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        read: false
      })),
      ...outOfStockProducts.map(product => ({
        id: product._id.toString(),
        type: 'stock',
        title: 'Out of Stock',
        message: `${product.name} is out of stock`,
        priority: 'high',
        timestamp: new Date().toISOString(),
        read: false
      })),
      ...highValueOrders.map(order => ({
        id: order._id.toString(),
        type: 'order',
        title: 'High Value Order',
        message: `Order #${order._id} - Rs ${order.amount.toLocaleString()}`,
        priority: 'medium',
        timestamp: new Date(order.date).toISOString(),
        read: false
      })),
      ...expiringDeals.map(deal => ({
        id: deal._id.toString(),
        type: 'deal',
        title: 'Deal Expiring Soon',
        message: `${deal.dealName} expires on ${deal.dealEndDate.toLocaleDateString()}`,
        priority: 'medium',
        timestamp: new Date().toISOString(),
        read: false
      }))
    ];

    res.json({ alerts });
  } catch (error) {
    console.error("Alerts Error:", error);
    res.status(500).json({ message: "Error fetching alerts" });
  }
};

/**
 * CUSTOMER ANALYTICS CONTROLLER
 */
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const dateRange = getDateRange(period);
    const startTimestamp = dateRange.start.getTime();
    const endTimestamp = dateRange.end.getTime();

    const totalCustomers = await User.countDocuments();

    const customerOrders = await Order.find({
      date: { $gte: startTimestamp, $lte: endTimestamp }
    });

    const uniqueCustomers = [...new Set(customerOrders.map(order => order.userId))];
    const repeatCustomers = uniqueCustomers.filter(customerId => {
      const customerOrderCount = customerOrders.filter(order => order.userId === customerId).length;
      return customerOrderCount > 1;
    }).length;

    res.json({
      totalCustomers,
      activeCustomers: uniqueCustomers.length,
      repeatCustomers,
      newCustomers: Math.max(0, uniqueCustomers.length - repeatCustomers),
      repeatRate: uniqueCustomers.length > 0 ? (repeatCustomers / uniqueCustomers.length) * 100 : 0,
      period
    });
  } catch (error) {
    console.error("Customer Analytics Error:", error);
    res.status(500).json({ message: "Error fetching customer analytics" });
  }
};

// Helper function
function getDateRange(timeRange) {
  const now = new Date();
  const start = new Date();

  switch (timeRange) {
    case 'daily':
      start.setDate(now.getDate() - 1);
      break;
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    default:
      start.setFullYear(now.getFullYear() - 1);
  }

  return { start, end: now };
}