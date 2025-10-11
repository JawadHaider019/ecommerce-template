import mongoose from "mongoose";

const dealProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    images: { type: [String], default: [] }, // URLs of images
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountprice: { type: Number, required: true }, // actual price
    cost: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: [String], required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true },

    // --- Deal Fields ---
    isDeal: { type: Boolean, default: false },
    dealName: { type: String },
    dealDescription: { type: String },
    dealDiscountType: { type: String }, // "percentage" or "flat"
    dealDiscountValue: { type: Number },
    dealProducts: { type: [dealProductSchema], default: [] },
    dealTotal: { type: Number },
    dealFinalPrice: { type: Number },
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
