import express from 'express'
import { signup, login, updateProfile } from '../controllers/userController.js';
import { protectRoute, checkAuth } from '../middleware/auth.js'; // ✅ FIXED THIS LINE

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth); // ✅ Now it will work

export default userRouter;
