import mongoose from "mongoose";
import "@/models/Client";
import "@/models/Project";
import "@/models/Task";
import "@/models/Milestone";
import "@/models/Deliverable";
import "@/models/Payment";
import "@/models/Activity";
import "@/models/Comment";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/workloom";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
