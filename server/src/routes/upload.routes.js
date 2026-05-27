import fs from "fs";
import path from "path";
import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/", "video/", "application/pdf"];
    if (allowed.some((type) => file.mimetype.startsWith(type) || file.mimetype === type)) return cb(null, true);
    cb(new Error("Only images, videos, and PDFs are allowed."));
  }
});

router.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

export default router;
