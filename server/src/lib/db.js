import mongoose from "mongoose";

export async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Set it in server/.env so data can be stored in MongoDB.");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
