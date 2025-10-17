import Comment from "../models/commentModel.js";

// GET all comments
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST new comment
export const addComment = async (req, res) => {
  try {
    const comment = new Comment(req.body);
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH mark as read
export const markRead = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH mark as unread
export const markUnread = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isRead: false }, { new: true });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH add reply
export const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.hasReply = true;
    comment.isRead = true;
    comment.reply = { content, author: "Admin", date: new Date() };
    const updatedComment = await comment.save();

    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE comment
export const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
