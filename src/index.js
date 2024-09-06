import express from "express";
import connectDB from "./db/connect.js";
import "dotenv/config";


const app = express();
// console.log(process.env.MONGO_URI)
connectDB();