import dotenv from "dotenv"
import express from "express"
import connectDB from "./db.js"

dotenv.config();

connectDB();

const app = express();

app.listen(process.env.PORT, () => {
    console.log("Server dotenv is running");
});