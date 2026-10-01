import couponModel from "../models/couponModel.js";
import productModel from "../models/productModel.js";

// ==================== ADMIN ACTIONS ====================

// 1. Create Coupon (Admin)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      appliesTo,
      applicableProducts,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      usageLimitPerUser,
      isActive,
      isPublic,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existingCoupon = await couponModel.findOne({ code: cleanCode });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: "A coupon with this code already exists" });
    }

    if (discountAmount === undefined || discountAmount === null || Number(discountAmount) <= 0) {
      return res.status(400).json({ success: false, message: "Please provide a valid discount amount greater than 0" });
    }

    if (discountType === "percentage" && Number(discountAmount) > 100) {
      return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100%" });
    }

    const newCoupon = new couponModel({
      code: cleanCode,
      description: description ? description.trim() : "",
      discountType: discountType || "percentage",
      discountAmount: Number(discountAmount),
      appliesTo: appliesTo === "specific" ? "specific" : "all",
      applicableProducts:
        appliesTo === "specific" && Array.isArray(applicableProducts)
          ? applicableProducts
          : [],
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : 1,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully!`,
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("❌ Error in createCoupon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Coupons with Stats (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponModel
      .find({})
      .populate("applicableProducts", "name price image category")
      .sort({ createdAt: -1 });

    // Calculate quick stats
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const totalDiscountsGiven = coupons.reduce((sum, c) => {
      const couponDiscounts = (c.usedBy || []).reduce((sub, u) => sub + (u.discountApplied || 0), 0);
      return sum + couponDiscounts;
    }, 0);

    res.json({
      success: true,
      coupons,
      stats: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalDiscountsGiven: Math.round(totalDiscountsGiven * 100) / 100,
      },
    });
  } catch (error) {
    console.error("❌ Error in getAllCoupons:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Single Coupon (Admin)
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponModel
      .findById(id)
      .populate("applicableProducts", "name price image category");

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    console.error("❌ Error in getCouponById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Coupon (Admin)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountAmount,
      appliesTo,
      applicableProducts,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      usageLimitPerUser,
      isActive,
      isPublic,
    } = req.body;

    const coupon = await couponModel.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== coupon.code) {
        const existing = await couponModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ success: false, message: "A coupon with this code already exists" });
        }
        coupon.code = cleanCode;
      }
    }

    if (description !== undefined) coupon.description = description.trim();
    if (discountType) coupon.discountType = discountType;
    if (discountAmount !== undefined) {
      if (Number(discountAmount) <= 0) {
        return res.status(400).json({ success: false, message: "Discount amount must be greater than 0" });
      }
      if (coupon.discountType === "percentage" && Number(discountAmount) > 100) {
        return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100%" });
      }
      coupon.discountAmount = Number(discountAmount);
    }

    if (appliesTo !== undefined) coupon.appliesTo = appliesTo === "specific" ? "specific" : "all";
    if (applicableProducts !== undefined) {
      coupon.applicableProducts = Array.isArray(applicableProducts) ? applicableProducts : [];
    }

    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount) || 0;
    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    }
    if (startDate !== undefined) coupon.startDate = startDate ? new Date(startDate) : new Date();
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (usageLimitPerUser !== undefined) coupon.usageLimitPerUser = Number(usageLimitPerUser) || 1;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);
    if (isPublic !== undefined) coupon.isPublic = Boolean(isPublic);

    await coupon.save();

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" updated successfully!`,
      coupon,
    });
  } catch (error) {
    console.error("❌ Error in updateCoupon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Coupon (Admin)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponModel.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" deleted successfully!`,
    });
  } catch (error) {
    console.error("❌ Error in deleteCoupon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Toggle Coupon Active Status (Admin)
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponModel.findById(id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" is now ${coupon.isActive ? "Active" : "Inactive"}`,
      coupon,
    });
  } catch (error) {
    console.error("❌ Error in toggleCouponStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== USER / CLIENT ACTIONS ====================

// 7. Validate and Apply Coupon (Public / Client / Guest / Logout User)
export const validateAndApplyCoupon = async (req, res) => {
  try {
    const { code, cartSubtotal, userEmail, userId, items } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "Please enter a coupon code" });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await couponModel.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ success: false, message: `Coupon "${cleanCode}" does not exist` });
    }

    const subtotal = Number(cartSubtotal) || 0;
    const userIdentifier = userEmail || userId || null;
    const cartItems = Array.isArray(items) ? items : [];

    // Validate using model method (passes items for product-level restriction check)
    const validation = coupon.isValid(subtotal, userIdentifier, cartItems);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Calculate discount amount
    const discountAmount = coupon.calculateDiscount(subtotal, cartItems);

    res.json({
      success: true,
      message: `Coupon "${cleanCode}" applied successfully! You saved Rs. ${discountAmount.toFixed(2)}`,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        appliesTo: coupon.appliesTo,
        applicableProducts: coupon.applicableProducts,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
      discount: discountAmount,
      newSubtotal: Math.max(0, subtotal - discountAmount),
    });
  } catch (error) {
    console.error("❌ Error in validateAndApplyCoupon:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Get Public Available Coupons (Client)
export const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await couponModel
      .find({
        isActive: true,
        isPublic: true,
        $or: [{ startDate: { $lte: now } }, { startDate: null }],
        $or: [{ expiryDate: { $gt: now } }, { expiryDate: null }],
      })
      .select("code description discountType discountAmount appliesTo applicableProducts minOrderAmount maxDiscountAmount expiryDate")
      .limit(10);

    res.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("❌ Error in getAvailableCoupons:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
