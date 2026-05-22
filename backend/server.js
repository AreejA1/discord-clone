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

// Routes
app.use("/api/auth", authRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// HTTP server
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log("Joined room:", room);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", {
      message: data.message,
      sender: data.sender,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});