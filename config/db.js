import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new MongoDB connection");
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    
    cached.promise = mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; 
  }
}