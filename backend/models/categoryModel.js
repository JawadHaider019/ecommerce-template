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
  _id: true, // Ensure subcategories get their own IDs
  timestamps: true
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subcategories: [subcategorySchema] // This ensures subcategories are objects
}, {
  timestamps: true
});

// Add a pre-save middleware to ensure subcategories are objects
categorySchema.pre('save', function(next) {
  // Filter out any string subcategories and convert them to objects
  this.subcategories = this.subcategories.map(sub => {
    if (typeof sub === 'string') {
      return {
        name: sub,
        count: 0
      };
    }
    return sub;
  });
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;