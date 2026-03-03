import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const { MONGODB_URI, DB_NAME } = process.env;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    if (!DB_NAME) {
      throw new Error("DB_NAME is not set");
    }

    console.log(`🔗 Connecting to ${DB_NAME} database`);

    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`✅ Connected to database: ${DB_NAME}`);

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Stop server if DB fails (production safe)
  }
};

export default connectDB;