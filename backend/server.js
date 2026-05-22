import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
/* 
   MongoDB Connection
 */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


/* 
   HTTP + Socket Server
 */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* 
   Socket.io logic
 */
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* 
   Start Server
 */
server.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});