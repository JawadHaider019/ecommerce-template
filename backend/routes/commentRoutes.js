import express from "express";
import {
  getComments,
  addComment,
  markRead,
  markUnread,
  addReply,
  likeComment,
  dislikeComment,
  removeLike,
  removeDislike,
  deleteComment,
  getNotifications,
} from "../controllers/commentController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", upload.array("images", 5), addComment);
router.patch("/:id/read", markRead);
router.patch("/:id/unread", markUnread);
router.patch("/:id/reply", addReply);
router.patch("/:id/like", likeComment);
router.patch("/:id/dislike", dislikeComment);
router.patch("/:id/remove-like", removeLike); // NEW
router.patch("/:id/remove-dislike", removeDislike); // NEW
router.delete("/:id", deleteComment);
router.get("/notifications/new", getNotifications);

export default router;