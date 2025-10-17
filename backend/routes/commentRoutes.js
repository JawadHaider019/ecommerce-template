import express from "express";
import { 
  getComments,
  addComment,
  markRead,
  markUnread,
  addReply,
  deleteComment
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", addComment);
router.patch("/read/:id", markRead);
router.patch("/unread/:id", markUnread);
router.patch("/reply/:id", addReply);
router.delete("/:id", deleteComment);

export default router;
