import express from "express";
import multer from "../middleware/multer.js";
import {
  getComments,
  addComment,
  markRead,
  markUnread,
  addReply,
  deleteComment,
  likeComment,
  dislikeComment,
  getNotifications 
} from "../controllers/commentController.js";

const router = express.Router();
const upload = multer.array("reviewImages", 10);

// ROUTES
router.get("/", getComments);             
router.post("/", upload, addComment);     
router.patch("/:id/read", markRead);      
router.patch("/:id/unread", markUnread);  
router.patch("/:id/reply", addReply);     
router.patch("/:id/like", likeComment);   // ✅ New route
router.patch("/:id/dislike", dislikeComment); // ✅ New route
router.delete("/:id", deleteComment);    
router.get("/notifications", getNotifications); 

export default router;
