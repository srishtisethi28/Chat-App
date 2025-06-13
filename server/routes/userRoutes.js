import express from 'express';
import { signup, login, updateProfile } from '../controllers/userController';
import { checkAuth, protectRoute } from '../middleware/auth';
const userRouter = express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute,updateProfile);
userRouter.get("/check",protectRoute,checkAuth);

export default userRouter;