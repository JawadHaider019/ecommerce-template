import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
    dealName: { type: String, required: true },
    dealDescription: { type: String },
    dealDiscountType: { type: String, default: "percentage" },
    dealDiscountValue: { type: Number, required: true },
    dealProducts: [{ 
        name: String,
        cost: Number,
        price: Number, 
        quantity: Number,
        total: Number
    }],
    dealImages: [{ type: String }],
    dealTotal: { type: Number },
    dealFinalPrice: { type: Number },
    dealStartDate: { type: Date, default: Date.now },
    dealEndDate: { type: Date },
    date: { type: Date, default: Date.now }
});

export default mongoose.model("deals", dealSchema);