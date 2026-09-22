import mongoose from "mongoose";
import dns from "node:dns";

import { DB_NAME } from "../constants.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );

        console.log(
            `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );

    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDB;