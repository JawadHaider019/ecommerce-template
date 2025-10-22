import mongoose from 'mongoose';

const businessDetailsSchema = new mongoose.Schema({
  company: {
    name: { type: String, default: "Natura Bliss" },
    tagline: { type: String, default: "Pure Natural Skincare" },
    description: { type: String, default: "Pure, handmade natural skincare products crafted with organic ingredients for your wellness." },
    foundedYear: { type: Number, default: 2023 }
  },
  contact: {
    customerSupport: {
      email: { type: String},
      phone: { type: String, default: "+92-333-3333" },
      hours: { type: String, default: "24/7" }
    }
  },
  location: {
    displayAddress: { type: String, default: "123 Natural Street, Green Valley, PK" },
    googleMapsLink: { type: String, default: "" }
  },
  socialMedia: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    whatsapp: { type: String, default: "" }
  },
  multiStore: {
    enabled: { type: Boolean, default: false },
    stores: [{
      storeId: String,
      storeName: String,
      storeType: { type: String, enum: ['warehouse', 'retail', 'cart'], default: 'warehouse' },
      location: {
        displayName: String,
        address: {
          street: String,
          city: String,
          state: String,
          zipCode: String
        },
        coordinates: {
          lat: { type: Number, default: 0 },
          lng: { type: Number, default: 0 }
        },
        googleMapsLink: String
      },
      contact: {
        phone: String,
        manager: String
      },
      operatingHours: {
        monday: { open: String, close: String, closed: Boolean },
        tuesday: { open: String, close: String, closed: Boolean },
        wednesday: { open: String, close: String, closed: Boolean },
        thursday: { open: String, close: String, closed: Boolean },
        friday: { open: String, close: String, closed: Boolean },
        saturday: { open: String, close: String, closed: Boolean },
        sunday: { open: String, close: String, closed: Boolean }
      },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      isActive: { type: Boolean, default: true },
      storeLogo: {
        url: String,
        public_id: String
      },
      createdAt: { type: Date, default: Date.now }
    }],
    defaultStore: { type: String, default: null }
  },
  logos: {
    website: { url: String, public_id: String },
    admin: { url: String, public_id: String },
    favicon: { url: String, public_id: String }
  },
  policies: {
    shipping: { type: String, default: "" },
    returns: { type: String, default: "" },
    privacy: { type: String, default: "" },
    terms: { type: String, default: "" }
  }
}, {
  timestamps: true
});

// Static method to get or create business details with connection check
businessDetailsSchema.statics.getBusinessDetails = async function() {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected');
    }

    console.log('🔍 Searching for business details...');
    
    let businessDetails = await this.findOne();
    
    if (!businessDetails) {
      console.log('📝 No business details found, creating default...');
      businessDetails = await this.create({});
      console.log('✅ Default business details created');
    } else {
      console.log('✅ Business details found:', businessDetails._id);
    }
    
    return businessDetails;
  } catch (error) {
    console.error('❌ Error in getBusinessDetails:', error);
    
    if (error.message === 'MongoDB is not connected') {
      throw new Error('Database connection failed. Please check your MongoDB connection.');
    }
    
    throw error;
  }
};

// Add connection state check method
businessDetailsSchema.statics.checkConnection = function() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    state: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState
  };
};

const BusinessDetails = mongoose.model('BusinessDetails', businessDetailsSchema);

export default BusinessDetails;