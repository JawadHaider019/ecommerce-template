import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountprice: { type: Number, required: true }, // actual price
    cost: { type: Number, required: true }, 
    quantity: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'scheduled'],
        default: 'draft'
    }
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
