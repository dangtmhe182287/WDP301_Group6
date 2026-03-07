import dotenv from "dotenv"
import express from "express"
import connectDB from "./src/config/db.js"

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;
db();
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

