import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Product Scope: 'all' products or 'specific' products
    appliesTo: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    },
    // List of Product IDs when appliesTo === 'specific'
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Only relevant for percentage discounts
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null, // null means never expires
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited uses overall
      min: 1,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1, // Number of times a single user/email can use this coupon
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        userId: {
          type: String,
          default: null,
        },
        email: {
          type: String,
          default: "",
          lowercase: true,
          trim: true,
        },
        orderId: {
          type: String,
          default: null,
        },
        discountApplied: {
          type: Number,
          default: 0,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true, // If true, can be shown in available coupons list
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if an item matches applicableProducts
couponSchema.methods.isProductApplicable = function (item) {
  if (this.appliesTo === "all") return true;
  if (!this.applicableProducts || this.applicableProducts.length === 0) return true;

  const itemId = (item.id || item.productId || item._id || "").toString();
  return this.applicableProducts.some(
    (prodId) => prodId.toString() === itemId
  );
};

// Virtual to check if coupon is currently valid
couponSchema.methods.isValid = function (orderAmount = 0, userIdentifier = null, items = []) {
  const now = new Date();

  // Check active status
  if (!this.isActive) {
    return { valid: false, message: "This coupon is currently inactive." };
  }

  // Check start date
  if (this.startDate && new Date(this.startDate) > now) {
    return { valid: false, message: "This coupon is not yet active." };
  }

  // Check expiry date
  if (this.expiryDate && new Date(this.expiryDate) < now) {
    return { valid: false, message: "This coupon has expired." };
  }

  // Check total usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: "This coupon has reached its maximum usage limit." };
  }

  // Check specific product scope if items are provided
  if (this.appliesTo === "specific" && this.applicableProducts && this.applicableProducts.length > 0) {
    if (items && items.length > 0) {
      const eligibleItems = items.filter((item) => this.isProductApplicable(item));
      if (eligibleItems.length === 0) {
        return {
          valid: false,
          message: "This coupon is only valid for specific products that are not currently in your cart.",
        };
      }

      // Check minOrderAmount against eligible items subtotal
      const eligibleSubtotal = eligibleItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );

      if (this.minOrderAmount && eligibleSubtotal < this.minOrderAmount) {
        return {
          valid: false,
          message: `Minimum subtotal of Rs. ${this.minOrderAmount.toFixed(
            2
          )} of eligible products required for this coupon (current eligible: Rs. ${eligibleSubtotal.toFixed(2)}).`,
        };
      }
    }
  } else {
    // Check minimum order amount for all products
    if (this.minOrderAmount && orderAmount < this.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of Rs. ${this.minOrderAmount.toFixed(2)} required for this coupon.`,
      };
    }
  }

  // Check per-user limit (supports both logged-in and guest user emails)
  if (userIdentifier && this.usageLimitPerUser) {
    const normalizedIdentifier = userIdentifier.toString().toLowerCase().trim();
    const userUses = this.usedBy.filter(
      (entry) =>
        (entry.userId && entry.userId.toString() === normalizedIdentifier) ||
        (entry.email && entry.email.toLowerCase().trim() === normalizedIdentifier)
    ).length;

    if (userUses >= this.usageLimitPerUser) {
      return {
        valid: false,
        message: `You have already used this coupon the maximum allowed number of times (${this.usageLimitPerUser}).`,
      };
    }
  }

  return { valid: true };
};

// Calculate discount amount for a given order subtotal and items
couponSchema.methods.calculateDiscount = function (subtotal = 0, items = []) {
  let baseAmount = subtotal;

  // If specific products, only discount eligible items
  if (
    this.appliesTo === "specific" &&
    this.applicableProducts &&
    this.applicableProducts.length > 0 &&
    items &&
    items.length > 0
  ) {
    const eligibleItems = items.filter((item) => this.isProductApplicable(item));
    baseAmount = eligibleItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }

  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (baseAmount * this.discountAmount) / 100;
    if (this.maxDiscountAmount && this.maxDiscountAmount > 0) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else if (this.discountType === "fixed") {
    discount = Math.min(this.discountAmount, baseAmount);
  }

  return Math.max(0, Math.round(discount * 100) / 100);
};

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);
export default couponModel;
