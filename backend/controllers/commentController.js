import Comment from "../models/commentModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // ✅ for deleting temp files

// ✅ GET all comments (latest first) - UPDATED VERSION
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ date: -1 })
      .populate("productId", "name price images")
      .populate("orderId", "orderNumber total")
      .populate("userId", "name email");

    // Transform data to match frontend expectations
    const transformedComments = comments.map(comment => ({
      ...comment.toObject(),
      // Ensure productImages is available for frontend
      productImages: comment.reviewImages?.map(img => img.url) || comment.productId?.images || []
    }));

    res.json(transformedComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments", error: err.message });
  }
};

// ✅ POST new comment (with Cloudinary upload)
export const addComment = async (req, res) => {
  try {
    const { targetType, productId, orderId, userId, content, rating } = req.body;

    if (!targetType || !userId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    let productData = {};
    if (targetType === "product" && productId) {
      const product = await Product.findById(productId).select("name price images");
      if (!product) return res.status(404).json({ message: "Product not found" });
      productData = { 
        productName: product.name, 
        productPrice: product.price
      };
    }

    // 🖼️ Upload images to Cloudinary
    let reviewImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder: "reviews",
          resource_type: "image",
        })
      );
      const results = await Promise.all(uploadPromises);

      reviewImages = results.map(r => ({
        url: r.secure_url
      }));

      // ✅ Remove local temp files
      req.files.forEach(file => fs.unlinkSync(file.path));
    }

    // 🧠 Create comment
    const comment = new Comment({
      targetType,
      productId,
      orderId,
      userId,
      author: user.name,
      email: user.email,
      content,
      rating: rating || 0,
      reviewImages,
      isNotified: true,
      ...productData,
    });

    const saved = await comment.save();
    
    // Populate the response to match frontend expectations
    const populatedComment = await Comment.findById(saved._id)
      .populate("productId", "name price images")
      .populate("userId", "name email");
      
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("❌ Add comment error:", err);
    res.status(400).json({ message: "Failed to add comment", error: err.message });
  }
};

// ✅ PATCH - Mark as read (disable notification)
export const markRead = async (req, res) => {
  try {
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { isRead: true, isNotified: false },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Comment not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to mark as read", error: err.message });
  }
};

// ✅ PATCH - Mark as unread
export const markUnread = async (req, res) => {
  try {
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { isRead: false },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Comment not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to mark as unread", error: err.message });
  }
};

// ✅ PATCH - Add admin reply
export const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Reply content is required" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.hasReply = true;
    comment.isRead = true;
    comment.reply = { content, author: "Admin", date: new Date() };

    const updated = await comment.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to add reply", error: err.message });
  }
};

// ✅ PATCH - Like comment
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.likes = (comment.likes || 0) + 1;
    const updated = await comment.save();

    res.json({ message: "Liked successfully", likes: updated.likes });
  } catch (err) {
    res.status(400).json({ message: "Failed to like comment", error: err.message });
  }
};

// ✅ PATCH - Dislike comment
export const dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.dislikes = (comment.dislikes || 0) + 1;
    const updated = await comment.save();

    res.json({ message: "Disliked successfully", dislikes: updated.dislikes });
  } catch (err) {
    res.status(400).json({ message: "Failed to dislike comment", error: err.message });
  }
};

// ✅ DELETE comment
export const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete comment", error: err.message });
  }
};

// ✅ GET - New notifications (unread + notified)
export const getNotifications = async (req, res) => {
  try {
    const newReviews = await Comment.find({ isNotified: true, isRead: false })
      .sort({ date: -1 })
      .populate("productId", "name price")
      .populate("userId", "name email");

    res.json(newReviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
};