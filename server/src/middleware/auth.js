import jwt from "jsonwebtoken";
import { getStoredUsers } from "../lib/fileStore.js";
import { User } from "../models/User.js";
import { isDbConnected } from "../lib/db.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = isDbConnected()
      ? await User.findById(payload.sub).select("-passwordHash")
      : getStoredUsers().find((item) => item._id === payload.sub);

    if (!user) return res.status(401).json({ message: "Invalid session" });
    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid session" });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this action" });
    }
    next();
  };
}
