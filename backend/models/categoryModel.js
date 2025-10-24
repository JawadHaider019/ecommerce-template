// models/categoryModel.js
import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  _id: true,
  timestamps: true
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  subcategories: [subcategorySchema]
}, {
  timestamps: true
});

// Add index for better performance
categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;