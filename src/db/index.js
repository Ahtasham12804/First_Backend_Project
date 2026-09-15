import mongoose from "mongoose";
import dns from "node:dns";
import { DB_NAME } from "../constants.js";

// Ensure Node resolves Atlas SRV records using public DNS on Windows
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        const baseUri = process.env.MONGODB_URI?.replace(/\/$/, "");
        const connectionInstance = await mongoose.connect(`${baseUri}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDB;