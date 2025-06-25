import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*"
  },
});

export const userSocketMap={};

//socket.io Connection handler
io.on("connection",(socket)=>{
  const userId=socket.handshake.query.userId;
  console.log("User connected",userId);
  if(userId) userSocketMap[userId]=socket.id;

  io.emit("getOnlineUsers",Object.keys(userSocketMap))

  socket.on("disconnect",()=>{
    console.log("user Disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
  })
})

app.use(cors());
app.use(express.json({limit: '4mb'}));

app.use("/api/status", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth",userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV!=="production"){

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default server;