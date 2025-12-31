import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    // User identification (optional for guests)
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    
    // Guest identification
    guestId: { 
        type: String, 
        default: null 
    },
    
    // Order type
    orderType: {
        type: String,
        enum: ['user', 'guest'],
        required: true,
        default: 'user'
    },
    
    // Temporary guest data (for guest orders only)
    guestData: {
        sessionId: { type: String, default: null },
        browserFingerprint: { type: String, default: null },
        ipAddress: { type: String, default: null }
    },
    
    // Order expiration for guest orders
    expiresAt: { 
        type: Date, 
        default: null 
    },
    
    // Auto-conversion tracking
    convertedToUser: { 
        type: Boolean, 
        default: false 
    },
    convertedAt: { 
        type: Date, 
        default: null 
    },
    convertedFromGuestId: { 
        type: String, 
        default: null 
    },
    
    // Order items
    items: { 
        type: Array, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    address: { 
        type: Object, 
        required: true 
    },
    status: { 
        type: String, 
        required: true, 
        default: "Pending Verification" 
    },
    
    // Payment
    paymentMethod: { 
        type: String, 
        required: true 
    },
    payment: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    
    // Customer details (for both guest and user orders)
    customerDetails: {
        name: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true 
        },
        phone: { 
            type: String, 
            default: '' 
        }
    },

    // Payment verification
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    paymentAmount: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    paymentScreenshot: { 
        type: String, 
        default: null 
    },
    paymentMethodDetail: { 
        type: String, 
        default: 'easypaisa' 
    },
    
    // Verification tracking
    verifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    verifiedAt: { 
        type: Date, 
        default: null 
    },
    rejectionReason: { 
        type: String, 
        default: null 
    },
    
    // Order timeline
    orderPlacedAt: { 
        type: Date, 
        default: Date.now 
    },
    paymentVerifiedAt: { 
        type: Date, 
        default: null 
    },
    orderConfirmedAt: { 
        type: Date, 
        default: null 
    },

    // Cancellation
    cancellationReason: { 
        type: String, 
        default: null 
    },
    cancelledAt: { 
        type: Date, 
        default: null 
    },
    cancelledBy: { 
        type: String, 
        default: null 
    },
    
    // Metadata
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, 
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Add indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ guestId: 1 });
orderSchema.index({ 'customerDetails.email': 1 });
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired orders
orderSchema.index({ orderType: 1, status: 1 });

// Pre-save middleware to set expiration for guest orders
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Set expiration for guest orders (30 days from creation)
    if (this.orderType === 'guest' && !this.expiresAt) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // 30 days retention
        this.expiresAt = expirationDate;
    }
    
    // Clear expiration for user orders or completed orders
    if (this.orderType === 'user' || 
        this.status === 'Delivered' || 
        this.status === 'Cancelled' || 
        this.convertedToUser) {
        this.expiresAt = null;
    }
    
    next();
});

const orderModel = mongoose.models.order || mongoose.model("orders", orderSchema);
export default orderModel;