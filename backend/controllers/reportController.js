import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs"; // ✅ Add this
import { Readable } from "stream";

//
// Utility: send CSV
//
const sendCSV = (res, filename, data) => {
  const parser = new Parser();
  const csv = parser.parse(data);
  res.header("Content-Type", "text/csv");
  res.attachment(filename);
  return res.send(csv);
};

//
// Utility: send PDF
//
const sendPDF = (res, filename, title, data) => {
  const doc = new PDFDocument({ margin: 30 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: "center" }).moveDown();
  doc.fontSize(10);

  data.forEach((row, index) => {
    doc.text(`${index + 1}. ${JSON.stringify(row, null, 2)}`);
    doc.moveDown(0.5);
  });

  doc.end();
};

//
// ✅ Utility: send Excel (.xlsx)
//
const sendExcel = async (res, filename, sheetName, data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  if (data.length > 0) {
    sheet.columns = Object.keys(data[0]).map((key) => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      width: 20,
    }));
    sheet.addRows(data);
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

//
// 📄 SALES REPORT
//
export const getSalesReport = async (req, res) => {
  try {
    const { format = "json" } = req.query;
    const orders = await orderModel.find();

    const salesData = orders.map((order) => {
      const totalCost = order.items.reduce(
        (sum, item) => sum + item.cost * item.quantity,
        0
      );
      const profit = order.amount - totalCost;
      return {
        orderId: order._id,
        userId: order.userId,
        totalAmount: order.amount,
        totalCost,
        profit,
        status: order.status,
        paymentMethod: order.paymentMethod,
        date: new Date(order.date).toLocaleDateString(),
      };
    });

    const summary = {
      totalOrders: salesData.length,
      totalRevenue: salesData.reduce((sum, o) => sum + o.totalAmount, 0),
      totalProfit: salesData.reduce((sum, o) => sum + o.profit, 0),
      avgOrderValue: (
        salesData.reduce((sum, o) => sum + o.totalAmount, 0) / salesData.length
      ).toFixed(2),
    };

    if (format === "csv") return sendCSV(res, "sales_report.csv", salesData);
    if (format === "pdf") return sendPDF(res, "sales_report.pdf", "Sales Report", salesData);
    if (format === "xlsx") return sendExcel(res, "sales_report.xlsx", "Sales Report", salesData);

    res.json({ summary, salesData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating sales report" });
  }
};

//
// 📦 INVENTORY REPORT
//
export const getInventoryReport = async (req, res) => {
  try {
    const { format = "json" } = req.query;
    const products = await productModel.find();

    const inventoryData = products.map((p) => ({
      productId: p._id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      cost: p.cost,
      price: p.discountprice,
      stockValue: p.quantity * p.cost,
      potentialRevenue: p.quantity * p.discountprice,
      status: p.status,
    }));

    const summary = {
      totalProducts: inventoryData.length,
      totalStockValue: inventoryData.reduce((sum, p) => sum + p.stockValue, 0),
      potentialRevenue: inventoryData.reduce((sum, p) => sum + p.potentialRevenue, 0),
      lowStock: inventoryData.filter((p) => p.quantity < 5).length,
    };

    if (format === "csv") return sendCSV(res, "inventory_report.csv", inventoryData);
    if (format === "pdf") return sendPDF(res, "inventory_report.pdf", "Inventory Report", inventoryData);
    if (format === "xlsx") return sendExcel(res, "inventory_report.xlsx", "Inventory Report", inventoryData);

    res.json({ summary, inventoryData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating inventory report" });
  }
};

//
// 👤 CUSTOMER REPORT
//
export const getCustomerReport = async (req, res) => {
  try {
    const { format = "json" } = req.query;
    const orders = await orderModel.find();

    const customerMap = {};
    orders.forEach((o) => {
      if (!customerMap[o.userId]) {
        customerMap[o.userId] = { userId: o.userId, orders: 0, totalSpent: 0 };
      }
      customerMap[o.userId].orders += 1;
      customerMap[o.userId].totalSpent += o.amount;
    });

    const customers = Object.values(customerMap).map((c) => ({
      ...c,
      avgOrderValue: (c.totalSpent / c.orders).toFixed(2),
    }));

    const summary = {
      totalCustomers: customers.length,
      repeatBuyers: customers.filter((c) => c.orders > 1).length,
      repeatRate: (
        (customers.filter((c) => c.orders > 1).length / customers.length) *
        100
      ).toFixed(2),
    };

    if (format === "csv") return sendCSV(res, "customer_report.csv", customers);
    if (format === "pdf") return sendPDF(res, "customer_report.pdf", "Customer Report", customers);
    if (format === "xlsx") return sendExcel(res, "customer_report.xlsx", "Customer Report", customers);

    res.json({ summary, customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating customer report" });
  }
};
