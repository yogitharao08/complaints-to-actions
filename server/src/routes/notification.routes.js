import express from "express";
import { isDbConnected } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";
import { demoNotifications } from "../seed/demoData.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  res.json(isDbConnected() ? await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean() : demoNotifications.filter((item) => item.userId === req.user._id));
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  if (isDbConnected()) return res.json(await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }));
  const note = demoNotifications.find((item) => item._id === req.params.id);
  if (note) note.isRead = true;
  res.json(note);
});

export default router;
