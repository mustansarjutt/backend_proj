import express from "express"

import cors from "cors"
import cookieParser from "cookie-parser"
import {limit} from "./constants.js"

const app = express()

// app.use() is use for middlewares and configurations
// assignment: explore more about cors and cookie-parser
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
// to handle json request
app.use(express.json({
    limit: limit
}))
// to handle url
app.use(express.urlencoded({extended: true, limit: limit}))
// to keep files like pdf in pdf
app.use(express.static("public"))
// to use crud opr on user's browser
app.use(cookieParser())
// multer is 3rd party packgae to configure file upload

// importing route
import userRouter from "./routes/user.router.js"
// route declareation
app.use("/api/v1/users", userRouter)

export default app