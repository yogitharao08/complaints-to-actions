import { Complaint } from "../models/Complaint.js";
import { Department } from "../models/Department.js";
import { Notification } from "../models/Notification.js";
import { StatusLog } from "../models/StatusLog.js";
import { User } from "../models/User.js";
import { demoComplaints, demoDepartments, demoNotifications, demoStatusLogs, demoUsers } from "../seed/demoData.js";

function withoutManagedTimestamps(record) {
  const { createdAt, updatedAt, ...rest } = record;
  return rest;
}

export async function seedMongo() {
  await Promise.all(demoUsers.map((user) => User.updateOne({ _id: user._id }, { $setOnInsert: withoutManagedTimestamps(user) }, { upsert: true })));
  await Promise.all(demoDepartments.map((department) => Department.updateOne({ _id: department._id }, { $setOnInsert: withoutManagedTimestamps(department) }, { upsert: true })));
  await Promise.all(demoComplaints.map((complaint) => Complaint.updateOne({ _id: complaint._id }, { $setOnInsert: withoutManagedTimestamps(complaint) }, { upsert: true })));

  if ((await StatusLog.countDocuments()) === 0) {
    await StatusLog.insertMany(demoStatusLogs);
  }

  if ((await Notification.countDocuments()) === 0) {
    await Notification.insertMany(demoNotifications);
  }
}
