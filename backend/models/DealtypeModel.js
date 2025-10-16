// models/DealtypeModel.js
import mongoose from 'mongoose';

const dealTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    // Remove required: true or make it optional
    // required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const DealType = mongoose.model('DealType', dealTypeSchema);
export default DealType;