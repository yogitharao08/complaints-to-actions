import express from "express";
import { isDbConnected } from "../lib/db.js";
import { getStoredNotifications, saveStoredNotifications } from "../lib/fileStore.js";
import { requireAuth } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = isDbConnected()
    ? await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
    : getStoredNotifications()
      .filter((item) => item.userId === req.user._id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  res.json(notifications);
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  if (isDbConnected()) return res.json(await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }));
  const notifications = getStoredNotifications();
  const note = notifications.find((item) => item._id === req.params.id && item.userId === req.user._id);
  if (note) note.isRead = true;
  saveStoredNotifications(notifications);
  res.json(note);
});

export default router;
