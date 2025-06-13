import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js"; 
import dotenv from "dotenv";
import { generateToken } from "../lib/utils.js";
dotenv.config();

export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    } 
    const salt =await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    const savedUser = await newUser.save();
    const token=generateToken(savedUser._id);
    res.status(201).json({
      message: "User created successfully and logged in",
      userData: {
        savedUser
      },
      token,
    });

    } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const login=async(req,res)=>{
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    } 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      userData: {
        user
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const {profilePic, fullName, bio } = req.body;
    const userId = req.user._id;
    
    let updatedUser;
    if(!profilePic)
    {
      updatedUser=await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });     
    }else
    {
      const upload=await cloudinary.uploader.upload(profilePic);
      updatedUser=await User.findByIdAndUpdate(
        userId,
        {  profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          updatedUser
        },
      });
    }
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}