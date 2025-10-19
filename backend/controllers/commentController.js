import Comment from "../models/commentModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";

// ✅ GET comments with product filtering - UPDATED VERSION
export const getComments = async (req, res) => {
  try {
    const { productId } = req.query;
    console.log('Fetching comments for product:', productId);
    
    let filter = {};
    if (productId) {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        filter.productId = new mongoose.Types.ObjectId(productId);
      } else {
        filter.productId = productId;
      }
    }

    const comments = await Comment.find(filter)
      .sort({ date: -1 })
      .populate("productId", "name price images")
      .populate("userId", "name email")
      .populate("likedBy", "name email")
      .populate("dislikedBy", "name email")
      .lean();

    console.log(`Found ${comments.length} comments for product ${productId}`);

    // Transform data to match frontend expectations
    const transformedComments = comments.map(comment => ({
      _id: comment._id,
      rating: comment.rating,
      content: comment.content,
      reviewImages: comment.reviewImages || [],
      date: comment.date,
      author: comment.author,
      email: comment.email,
      likes: comment.likes || 0,
      dislikes: comment.dislikes || 0,
      likedBy: comment.likedBy || [],
      dislikedBy: comment.dislikedBy || [],
      isRead: comment.isRead || false,
      hasReply: comment.hasReply || false,
      reply: comment.reply || null,
      targetType: comment.targetType,
      productName: comment.productName || (comment.productId ? comment.productId.name : 'Unknown Product'),
      productPrice: comment.productPrice || (comment.productId ? comment.productId.price : 'N/A'),
      productId: comment.productId?._id ? comment.productId._id.toString() : comment.productId
    }));

    res.json(transformedComments);
  } catch (err) {
    console.error("Error fetching comments:", err);
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

    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { 
        hasReply: true,
        isRead: true,
        isNotified: false,
        reply: {
          content: content,
          author: "Admin",
          date: new Date()
        }
      },
      { new: true }
    ).populate("productId", "name price images")
     .populate("userId", "name email")
     .lean();

    if (!updated) return res.status(404).json({ message: "Comment not found" });

    const transformedComment = {
      ...updated,
      productName: updated.productName || (updated.productId ? updated.productId.name : 'Unknown Product'),
      productPrice: updated.productPrice || (updated.productId ? updated.productId.price : 'N/A')
    };

    res.json(transformedComment);
  } catch (err) {
    console.error("Error adding reply:", err);
    res.status(400).json({ message: "Failed to add reply", error: err.message });
  }
};

// ✅ PATCH - Like comment with user tracking - UPDATED
export const likeComment = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Convert userId to ObjectId for comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user already liked
    const alreadyLiked = comment.likedBy.some(id => id.equals(userObjectId));
    
    // Check if user previously disliked - remove from dislikes if switching
    const alreadyDisliked = comment.dislikedBy.some(id => id.equals(userObjectId));

    if (alreadyLiked) {
      // User is toggling off their like
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedBy = comment.likedBy.filter(id => !id.equals(userObjectId));
    } else {
      // User is adding a like
      if (alreadyDisliked) {
        // Switching from dislike to like
        comment.dislikes = Math.max(0, comment.dislikes - 1);
        comment.dislikedBy = comment.dislikedBy.filter(id => !id.equals(userObjectId));
      }
      
      comment.likes = (comment.likes || 0) + 1;
      comment.likedBy.push(userObjectId);
    }

    const updated = await comment.save();

    res.json({ 
      message: alreadyLiked ? "Like removed" : "Liked successfully", 
      likes: updated.likes,
      dislikes: updated.dislikes
    });
  } catch (err) {
    console.error("Error liking comment:", err);
    res.status(400).json({ message: "Failed to like comment", error: err.message });
  }
};

// ✅ PATCH - Dislike comment with user tracking - UPDATED
export const dislikeComment = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Convert userId to ObjectId for comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user already disliked
    const alreadyDisliked = comment.dislikedBy.some(id => id.equals(userObjectId));
    
    // Check if user previously liked - remove from likes if switching
    const alreadyLiked = comment.likedBy.some(id => id.equals(userObjectId));

    if (alreadyDisliked) {
      // User is toggling off their dislike
      comment.dislikes = Math.max(0, comment.dislikes - 1);
      comment.dislikedBy = comment.dislikedBy.filter(id => !id.equals(userObjectId));
    } else {
      // User is adding a dislike
      if (alreadyLiked) {
        // Switching from like to dislike
        comment.likes = Math.max(0, comment.likes - 1);
        comment.likedBy = comment.likedBy.filter(id => !id.equals(userObjectId));
      }
      
      comment.dislikes = (comment.dislikes || 0) + 1;
      comment.dislikedBy.push(userObjectId);
    }

    const updated = await comment.save();

    res.json({ 
      message: alreadyDisliked ? "Dislike removed" : "Disliked successfully", 
      likes: updated.likes,
      dislikes: updated.dislikes
    });
  } catch (err) {
    console.error("Error disliking comment:", err);
    res.status(400).json({ message: "Failed to dislike comment", error: err.message });
  }
};

// ✅ PATCH - Remove like (toggle off) - NEW ENDPOINT
export const removeLike = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Remove user from likedBy and decrement likes
    comment.likedBy = comment.likedBy.filter(id => !id.equals(userObjectId));
    comment.likes = Math.max(0, comment.likes - 1);

    const updated = await comment.save();

    res.json({ 
      message: "Like removed successfully", 
      likes: updated.likes,
      dislikes: updated.dislikes
    });
  } catch (err) {
    console.error("Error removing like:", err);
    res.status(400).json({ message: "Failed to remove like", error: err.message });
  }
};

// ✅ PATCH - Remove dislike (toggle off) - NEW ENDPOINT
export const removeDislike = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Remove user from dislikedBy and decrement dislikes
    comment.dislikedBy = comment.dislikedBy.filter(id => !id.equals(userObjectId));
    comment.dislikes = Math.max(0, comment.dislikes - 1);

    const updated = await comment.save();

    res.json({ 
      message: "Dislike removed successfully", 
      likes: updated.likes,
      dislikes: updated.dislikes
    });
  } catch (err) {
    console.error("Error removing dislike:", err);
    res.status(400).json({ message: "Failed to remove dislike", error: err.message });
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