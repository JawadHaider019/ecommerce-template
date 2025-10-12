import mongoose from "mongoose";

const dealProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

const dealSchema = new mongoose.Schema({
  dealName: { type: String, required: true },
  dealDescription: { type: String },
  dealDiscountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
  dealDiscountValue: { type: Number, required: true },
  dealProducts: [dealProductSchema],
  dealImage: { type: String }, // Main deal image
  dealTotal: { type: Number, required: true },
  dealFinalPrice: { type: Number, required: true },
  dealStartDate: { type: Date, default: Date.now },
  dealEndDate: { type: Date },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Deal", dealSchema);