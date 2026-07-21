import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { connectDb } from "./lib/db.js";
import { isDbConnected } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.set("trust proxy", 1);

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : [];

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    // If no origin (e.g. server-to-server or postman), allow
    if (!origin) return callback(null, true);
    
    // If CLIENT_ORIGIN is not configured, or the origin is explicitly allowed
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Complaint to Action API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/users", userRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

connectDb().then(async () => {
  app.listen(port, () => {
    console.log(`Complaint to Action API listening on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
