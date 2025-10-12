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
    { name: "dealImage1", maxCount: 1 },
    { name: "dealImage2", maxCount: 1 },
    { name: "dealImage3", maxCount: 1 },
    { name: "dealImage4", maxCount: 1 }
  ]), 
  addDeal
);

dealRoutes.get("/list", listDeals);
dealRoutes.post("/remove", adminAuth, removeDeal);
dealRoutes.post("/single", singleDeal);

export default dealRoutes;