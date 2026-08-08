import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import authRouter from "./src/modules/auth/authRoutes.js";
import farmerRouter from "./src/modules/farmer/farmerRoutes.js";
import buyerRouter from "./src/modules/buyer/buyerRoutes.js";

import cropRouter from "./src/modules/crop/cropRoutes.js";
import bidRouter from "./src/modules/Bid/bidRoutes.js";
import orderRouter from "./src/modules/order/orderRoutes.js";
import driverRouter from "./src/modules/Driver/driverRoutes.js";
import deliveryRouter from "./src/modules/Delivery/deliveryRoutes.js";
import { initSocket } from "./src/socket/socket.js";
import expenseRouter from "./src/modules/expense/expenseRoutes.js";
import govRouter from "./src/modules/government/governRoutes.js";
import adminAuthRouter from "./src/modules/admin/adminauth/adminAuthRoute.js";
import servicesRouter from "./src/modules/admin/services/servicesRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Request logging middleware (optional)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/farmer", farmerRouter);
app.use("/api/buyer", buyerRouter);
app.use("/api/crop", cropRouter);
app.use("/api/bid", bidRouter);
app.use("/api/order", orderRouter);
app.use("/api/driver", driverRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/gov", govRouter);



//Added by ayush
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/services",servicesRouter)



// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  
  // Handle specific error types
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Initialize Socket.IO with the server
initSocket(server);

// Start the server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export { app, server };