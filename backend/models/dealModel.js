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
    dealType: {
        type: String,
        enum: ['flash_sale', 'seasonal', 'clearance', 'bundle', 'featured','buyonegetone'],
        default: 'flash_sale'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'scheduled'],
        default: 'draft'
    },
    date: { type: Date, default: Date.now },
    // Add to dealSchema
views: { type: Number, default: 0 },
clicks: { type: Number, default: 0 },
totalSales: { type: Number, default: 0 },
revenue: { type: Number, default: 0 }
});

export default mongoose.model("deals", dealSchema);