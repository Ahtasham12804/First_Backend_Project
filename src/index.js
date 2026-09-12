// database se jab bhi baat krni ho to async await ka use krna hoga or try catch ka use krna hoga taki error ko handle kiya ja ske




import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

//require('dotenv').config({path: './.env'});
import dotenv from "dotenv";


import connectDB from "./db/index.js"; // Import the connectDB function from db/index.js
// import{app} from "./app.js"; 
dotenv.config({path: './.env'});

connectDB() // Call the function to connect to the database
.then(() => {
    app.listen(process.env.PORT||8000, () => {
        console.log(`Server is running on port: ${process.env.PORT}`);
    });
}) 

.catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with an error code
});













// this is first approch .. in this we are writing all code in this file only 


// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js"; 


// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on("error", (error) => {
//       console.error("ERROR:", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//         console.log(`App is running on port ${process.env.PORT}`);
//     })


//   } catch (error) {
//     console.error("ERROR:", error);

//   }
// })()