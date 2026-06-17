import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "sp_consultancy",
      bufferCommands: false, // ✅ fail fast
    }).catch((error) => {
      cached.promise = null; // ✅ reset on failure so next call retries
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}