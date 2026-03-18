import "./src/config/env.js"
import app from "./src/app.js";
import db from "./src/config/db.js"
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
db();
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

