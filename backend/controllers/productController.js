import {v2 as cloudinary} from 'cloudinary'
import productModel from '../models/productModel.js'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to add product
const addProduct = async (req, res) => {
  try {
    const { name, description, cost, price, discountprice, quantity, category, subcategory, bestseller } = req.body;
    
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url
      })
    )

    const productData = {
      name,
      description,
      category,
      subcategory,
      cost: Number(cost),
      price: Number(price),
      discountprice: Number(discountprice),
      quantity: Number(quantity),
      bestseller: bestseller === 'true' ? true : false,
      image: imagesUrl,
      status: 'draft', // Add default status
      date: Date.now()
    }

    console.log(productData)

    const product = new productModel(productData);
    await product.save()

    res.json({ success: true, message: 'Product Added' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Function to list products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// Function to remove product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// Function to get single product
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}


const updateProduct = async (req, res) => {
  try {
    const { id, name, description, cost, price, discountprice, quantity, category, subcategory, bestseller, status } = req.body;
    
    console.log("=== UPDATE PRODUCT ===");
    console.log("Request body:", req.body);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is required" 
      });
    }

    const updateData = {
      name,
      description,
      category,
      subcategory,
      cost: Number(cost),
      price: Number(price),
      discountprice: Number(discountprice),
      quantity: Number(quantity),
      bestseller: bestseller === 'true' || bestseller === true,
      status: status || 'draft'
    };

    // Note: Removed file upload logic since we're not handling image updates via this endpoint
    // If you need to update images, create a separate endpoint

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    console.log("Product updated successfully:", updatedProduct);

    res.json({ 
      success: true, 
      message: "Product Updated Successfully", 
      product: updatedProduct 
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
// ADD THIS FUNCTION - Update Product Status
const updateProductStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    console.log("=== UPDATE PRODUCT STATUS ===");
    console.log("Request body:", req.body);

    if (!id || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID and status are required" 
      });
    }

    const validStatuses = ['draft', 'published', 'archived', 'scheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be: draft, published, archived, or scheduled" 
      });
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    console.log("Product status updated successfully:", updatedProduct);

    res.json({ 
      success: true, 
      message: "Product status updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Update Product Status Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

// Function to get products by status
const getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const products = await productModel.find({ status });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  updateProduct,
  updateProductStatus,
  getProductsByStatus
}