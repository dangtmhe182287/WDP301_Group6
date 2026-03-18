import express from "express"
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"
import morgan from 'morgan';
import router from "./routes/index.js"
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

app.get("/", (req, res) =>{
    res.send("API is running ...");
})
app.use(router);

export default app;
