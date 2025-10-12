import { v2 as cloudinary } from "cloudinary";
import dealModel from "../models/dealModel.js";

// ---------------- Add Deal ----------------
const addDeal = async (req, res) => {
  try {
    const {
      dealName,
      dealDescription,
      dealDiscountType,
      dealDiscountValue,
      dealProducts,
      dealTotal,
      dealFinalPrice,
      dealStartDate,
      dealEndDate
    } = req.body;

    console.log("=== DEAL UPLOAD ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // Get deal images from req.files
    const dealImage1 = req.files.dealImage1 && req.files.dealImage1[0];
    const dealImage2 = req.files.dealImage2 && req.files.dealImage2[0];
    const dealImage3 = req.files.dealImage3 && req.files.dealImage3[0];
    const dealImage4 = req.files.dealImage4 && req.files.dealImage4[0];

    const dealImages = [dealImage1, dealImage2, dealImage3, dealImage4].filter((item) => item !== undefined);

    console.log("Deal images to upload:", dealImages.length);

    // Upload deal images to Cloudinary
    let dealImagesUrl = await Promise.all(
      dealImages.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
          folder: "deals"
        });
        return result.secure_url;
      })
    );

    // Parse deal products
    let parsedDealProducts = [];
    if (dealProducts) {
      if (typeof dealProducts === 'string') {
        try {
          parsedDealProducts = JSON.parse(dealProducts);
        } catch (parseError) {
          console.error("Error parsing deal products:", parseError);
          return res.status(400).json({ 
            success: false, 
            message: "Invalid deal products format" 
          });
        }
      } else {
        parsedDealProducts = dealProducts;
      }
    }

    const dealData = {
      dealName,
      dealDescription: dealDescription || "",
      dealDiscountType: dealDiscountType || "percentage",
      dealDiscountValue: Number(dealDiscountValue),
      dealProducts: parsedDealProducts,
      // REMOVED: dealImage field - only storing array of images
      dealImages: dealImagesUrl, // Array of ALL images only
      dealTotal: Number(dealTotal || 0),
      dealFinalPrice: Number(dealFinalPrice || 0),
      dealStartDate: dealStartDate ? new Date(dealStartDate) : new Date(),
      dealEndDate: dealEndDate ? new Date(dealEndDate) : null,
      date: Date.now()
    };

    console.log("Deal data (images array only):", dealData);

    const deal = new dealModel(dealData);
    await deal.save();

    console.log("Deal saved successfully with images array only");

    res.json({ 
      success: true, 
      message: "Deal Created Successfully",
      deal: dealData
    });

  } catch (error) {
    console.error("Add Deal Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------- List Deals ----------------
const listDeals = async (req, res) => {
  try {
    const deals = await dealModel.find({}).sort({ date: -1 });
    res.json({ 
      success: true, 
      deals,
      count: deals.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------- Remove Deal ----------------
const removeDeal = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Deal ID is required" 
      });
    }

    const deal = await dealModel.findByIdAndDelete(id);
    
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: "Deal not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Deal Removed Successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ---------------- Get Single Deal ----------------
const singleDeal = async (req, res) => {
  try {
    const { dealId } = req.body;
    
    if (!dealId) {
      return res.status(400).json({ 
        success: false, 
        message: "Deal ID is required" 
      });
    }

    const deal = await dealModel.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: "Deal not found" 
      });
    }

    res.json({ 
      success: true, 
      deal 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export {
  addDeal,
  listDeals,
  removeDeal,
  singleDeal
};