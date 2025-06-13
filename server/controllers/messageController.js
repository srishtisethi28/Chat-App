import Message from "../models/message";
import cloudinary from "../lib/cloudinary";
import User from "../models/user";
import {io,userSocketMap} from "../server.js"


export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filterdUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    const unseenMessages = {};
    const promises = filterdUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({
      users: filterdUsers,
      unseenMessages,
    });
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id:selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
        $or: [
            { senderId: myId, receiverId: selectedUserId },
            { senderId: selectedUserId, receiverId: myId },
        ],
        })
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId},{seen: true });
        res.json({success: true, messages});
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}   

export const sendMessage = async (req, res) => {
  try {
    const {text,image}=req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if(image){
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      text,
      image: imageUrl,
      senderId,
      receiverId,
    });
    await newMessage.save();

    const recieverSocketId=userSocketMap[receiverId];
    if(recieverSocketId)
    {
        io.to(recieverSocketId).emit("newMessage",newMessage )
    }

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}