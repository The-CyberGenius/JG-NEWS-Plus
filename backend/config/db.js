import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MONGO_URI = 'mongodb+srv://jg_shiva:ke2Y8ekRXcc8y5v2@cluster0.lupm36o.mongodb.net/jg_news_plus?retryWrites=true&w=majority';

// Cache database connection across serverless invocations (Vercel)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (cached.conn) {
        return cached.conn;
    }

    const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        }).then((mongooseInstance) => {
            console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error(`MongoDB Connection Error: ${error.message}`);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
};

export default connectDB;

