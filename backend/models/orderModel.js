import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    items: {type: Array, required: true},
    amount: {type: Number, required: true},
    address: {type: Object, required: true},
    status: {type: String, required: true, default: "Order Placed"},
    paymentMethod: {type: String, required: true},
    payment: {type: Boolean, required: true, default: false},
    date: {type: Number, required: true},
    deliveryCharges: {type: Number, required: true, default: 0}, // ✅ Add this line

    cancellationReason: {type: String, default: null},
    cancelledAt: {type: Date, default: null},
    cancelledBy: {type: String, default: null}, // 'user' or 'admin'
    
    createdAt: { type: Date, default: Date.now }, 
    updatedAt: { type: Date, default: Date.now }
})

const orderModel =  mongoose.models.order || mongoose.model("orders", orderSchema)
export default orderModel;