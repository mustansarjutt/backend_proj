import connectDB from "./db/connect.js"
import "dotenv/config"
import app from "./app.js"

// console.log(process.env.MONGO_URI)
// connnection db is aysn function and async code return a promise
connectDB()
.then(() => {
    app.on("error", (err) => {
        console.log("Error: ", err)
    })
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is listening on http://localhost:${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("Connection Failed ", err)
})

// app.get("GET", (err, req, res, next) => {})
// next is a flag