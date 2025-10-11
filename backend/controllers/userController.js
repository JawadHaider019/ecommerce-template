import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator';
import Setting from "../models/settingModel.js";

const createToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}
// Route for user login 
const loginUser =async (req, res)=>{
   try{
const {email,password}=req.body;
const user=await userModel.findOne({email});
if(!user){
    return res.json({success:false, message:"User doesn't exists"})
}
const isMatch =await bcrypt.compare(password, user.password);
if(isMatch){
    const token =createToken(user._id)
    res.json({success:true,token})
}
else{
    res.json({success:false, message:"Invalid credentials"})
}
   }catch(error){
        console.log(error);
        res.json({success:false,message:error.messagen})
   }

}

// Route for user register
const registerUser =async(req, res)=>{

    try{
const{name,email,password} =req.body;

// checking user already exists or not 

const exists = await userModel.findOne({email});

if(exists)
{
    return res.json({success:false, message:"User already exists"})
}
if (!validator.isEmail(email)){
    return res.json({success:false, message:"Please enter a valid email"})
}
if (password.length<8){
    return res.json({success:false, message:"Please enter a strong password"})
}

//hashing user password 
const salt =await bcrypt.genSalt(10)
const hashedPassword =await bcrypt.hash(password,salt)

const newUser = new userModel({
    name,
    email,
    password:hashedPassword
})

    const user =await newUser.save()
const token =createToken(user._id)
res.json({success:true,token})

    }catch(error)
    {
        console.log(error);
        res.json({success:false,message:error.messagen})
    }
}
// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let settings = await Setting.findOne();

    // First-time setup
    if (!settings) {
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        return res.json({ success: false, message: "Admin credentials not set" });
      }

      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      settings = new Setting({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        notifications: true,
      });
      await settings.save();
    }

    // Validate email
    if (email !== settings.email) {
      return res.json({ success: false, message: "Invalid email" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, settings.password || "");
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // ✅ JWT token with admin flag
    const token = jwt.sign(
      { email: settings.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
loginUser,
registerUser,
adminLogin
}