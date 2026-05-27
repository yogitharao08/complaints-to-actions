import mongoose from "mongoose";

export async function connectDb() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. API will serve demo data only.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.warn("MongoDB connection failed. Falling back to demo data.");
    console.warn(error.message);
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
