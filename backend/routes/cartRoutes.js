import express from "express"
import { addToCart,getCart,updateCart } from "../controllers/cartController.js"
import { authUser } from "../middleware/auth.js"
const cartRoutes = express.Router()

cartRoutes.get("/",authUser, getCart)
cartRoutes.post("/add",authUser, addToCart)
cartRoutes.post("/update",authUser, updateCart)

export default cartRoutes;