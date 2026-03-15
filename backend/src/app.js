import express from "express"
import cors from "cors"
import morgan from 'morgan';
import router from "./routes/index.js"
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

app.get("/", (req, res) =>{
    res.send("API is running ...");
})
app.use(router);

export default app;