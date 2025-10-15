import express from 'express';
import cors from "cors"; 
import dotenv from "dotenv";
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingRoutes from "./routes/settingRoutes.js";
import dealRoutes from './routes/dealRoutes.js';
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// App Config    
const app = express();
const port = process.env.PORT || 4000;
dotenv.config();
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json()); 
app.use(cors());

// API endpoints 
app.use('/api/user',userRoutes)
app.use('/api/product',productRoutes)
app.use('/api/deal',dealRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/order',orderRoutes)
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);




app.get('/', (req, res) => {
    res.send("API Working ✅");
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
