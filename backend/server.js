<<<<<<< HEAD
import "./src/config/env.js"
import app from "./src/app.js";
import db from "./src/config/db.js"

=======
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

dotenv.config({path: "./src/config/.env"});
>>>>>>> 2f561bf6bcdc5db45b0628bd2947e48ece1c53b4

const PORT = process.env.PORT || 5000;
db();
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

<<<<<<< HEAD
=======
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
>>>>>>> 2f561bf6bcdc5db45b0628bd2947e48ece1c53b4
