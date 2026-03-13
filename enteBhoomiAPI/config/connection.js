import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGOURI) {
            throw new Error("MONGOURI is not defined in environment variables");
        }

        const conn = await mongoose.connect(process.env.MONGOURI, {
            dbName: "entebhoomi"
        });

        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database: ${conn.connection.name}`);
    } catch (err) {
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1); // Exit process on connection failure
    }
};

export default connectDB;