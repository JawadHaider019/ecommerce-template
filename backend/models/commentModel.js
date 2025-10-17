import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: { type: String, default: "Admin" }
});

const commentSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productImages: { type: [String], default: [] },
  productPrice: { type: String, required: true },
  type: { type: String, enum: ["product", "deal"], required: true },
  author: { type: String, required: true },
  email: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  hasReply: { type: Boolean, default: false },
  reply: { type: replySchema, default: null }
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
