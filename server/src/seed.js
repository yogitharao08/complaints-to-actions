import dotenv from "dotenv";
import { connectDb } from "./lib/db.js";
import { seedMongo } from "./lib/seedMongo.js";
import mongoose from "mongoose";

dotenv.config();

async function run() {
  try {
    console.log("Connecting to database...");
    await connectDb();
    
    console.log("Seeding database with demo data...");
    await seedMongo();
    
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  }
}

run();
