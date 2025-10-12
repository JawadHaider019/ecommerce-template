import express from "express";
import upload from "../middleware/multer.js";
import {
  addDeal,
  listDeals,
  removeDeal,
  singleDeal
} from "../controllers/dealController.js";
import adminAuth from "../middleware/adminAuth.js";

const dealRoutes = express.Router();


dealRoutes.post("/add", 
  adminAuth,
  upload.fields([
    { name: "dealImage", maxCount: 4 } 
  ]), 
  addDeal
);

dealRoutes.get("/list", listDeals);
dealRoutes.post("/remove", adminAuth, removeDeal);
dealRoutes.post("/single", singleDeal);

export default dealRoutes;