import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable")
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined
}

export async function connectDB() {
  if (global._mongooseConn) return global._mongooseConn

  global._mongooseConn = mongoose
    .connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "investment_manager",
    })
    .then((m) => {
      console.log("[v0] Connected to MongoDB")
      return m
    })

  return global._mongooseConn
}
