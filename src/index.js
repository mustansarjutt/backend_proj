// require("dotenv").config({path: "../env"})

// import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/connect.js";

dotenv.config({
    path: '../.env'
})

const app = express();

connectDB();



// professionals use semi-colons before IIFE
// this is our first approach to connect with database
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//         app.on("error", (error) => {
//             console.log("Unable to connect to db", error);
//             throw error;
//         });

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// })();