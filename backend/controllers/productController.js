import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      cost,
      price,
      discountprice,
      quantity,
      category,
      subcategory,
      bestseller,
      isDeal,
      dealName,
      dealDescription,
      dealDiscountType,
      dealDiscountValue,
      dealProducts,
      dealFinalPrice,
    } = req.body;

    // --- Upload main product images ---
    const mainImages = Object.values(req.files || {}).filter(f => f[0]?.fieldname.startsWith("image"));
    const imagesUrl = await Promise.all(
      mainImages.map(async (fileArr) => {
        const file = fileArr[0];
        const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    let productData = {
      name,
      description,
      category,
      subcategory,
      cost: Number(cost || 0),
      price: Number(price || 0),
      discountprice: Number(discountprice || 0),
      quantity: Number(quantity || 0),
      bestseller: bestseller === "true",
      image: imagesUrl,
      date: Date.now(),
    };

    // --- Handle deal ---
    if (isDeal === "true" || isDeal === true) {
      // Upload multiple deal images
      let dealImagesUrl = [];
      if (req.files.dealImages) {
        dealImagesUrl = await Promise.all(
          req.files.dealImages.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
            return result.secure_url;
          })
        );
      }

      // Parse deal products JSON if needed
      let parsedDealProducts = [];
      if (dealProducts) {
        parsedDealProducts = typeof dealProducts === "string" ? JSON.parse(dealProducts) : dealProducts;
      }

      productData = {
        ...productData,
        isDeal: true,
        dealName,
        dealDescription,
        dealDiscountType,
        dealDiscountValue: Number(dealDiscountValue || 0),
        dealProducts: parsedDealProducts,
        dealImages: dealImagesUrl,   // ✅ multiple deal images
        dealTotal: parsedDealProducts.reduce((acc, p) => acc + (Number(p.total) || 0), 0),
        dealFinalPrice: Number(dealFinalPrice || 0),
      };
    }

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: isDeal ? "Deal Created Successfully" : "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Fun to list product
const listProducts = async (req, res) => {
try{
    const products = await productModel.find({});
    res.json({success:true,products})
}catch(error){
    console.log(error)
    res.json({success:false,message:error.message})
}
}
// Fun to remove product
const removeProduct = async (req, res) => {
    try{
        await productModel.findByIdAndDelete(req.body.id)
    res.json({success:true,message: "Product Removed"})
    }catch(error){
        console.log(error)
        res.json({success:false, message: error.message})
    }

}
// Fun to single product
const singleProduct = async (req, res) => {
try{
    const {productId}=req.body
    const product =await productModel.findById(productId)
    res.json({success:true,product})
}catch(error){
    console.log(error)
    res.json({success:false, message: error.message})
}
}

export {
    addProduct,
    listProducts,
    removeProduct,
    singleProduct
}