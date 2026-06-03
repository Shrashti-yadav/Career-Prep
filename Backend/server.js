// ✅ MUST be the very first import — loads .env before anything else
import "./config/env.js";

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

import resumeHistoryRoutes from "./routes/resumeHistoryRoutes.js";
//import revisionRoutes from "./routes/revisionRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import notesRoutes from "./routes/notesRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

// ✅ Confirm env loaded correctly
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

connectDB();

const app = express();
const server = http.createServer(app);

// const allowedOrigin = [
//   "http://localhost:5173",
//   "http://localhost:5174",
// ];

const allowedOrigin = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL // Your live production frontend URL (Vercel/Netlify)
].filter(Boolean);
// SOCKET IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// MIDDLEWARE
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.set("io", io);

// ROUTES
app.get("/", (req, res) => res.send("API is running"));

//app.use("/api/revision", revisionRoutes);
//app.use("/api/history", historyRoutes);
//app.use("/api/history/resume", resumeHistoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/analyze", resumeRoutes);
//app.use("/api/history/notes", notesRoutes);
app.use("/api/history/resume", resumeHistoryRoutes);
app.use("/api/history/notes", notesRoutes);
app.use("/api/feedback", feedbackRoutes);

// SOCKET
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`Joined room: ${userId}`);
  }
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

// ERROR HANDLERS
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});