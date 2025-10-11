import express from 'express';
import { loginUser,registerUser,adminLogin } from '../controllers/userController.js';

const userRoutes= express.Router();

userRoutes.post('/register',registerUser)
userRoutes.post('/login',loginUser)
userRoutes.post('/admin',adminLogin)

export default userRoutes;
