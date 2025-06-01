import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js"
import usersRoute from "./routes/usersRoutes.js"
import cors from "cors";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

dotenv.config()



const app = express();
const port = process.env.PORT;

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add cookie parser middleware
app.use(cookieParser());

// Add session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use("/api/admin", adminRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/service/user", usersRoute)

app.get("/", (req,res,next) =>{
    res.send("hello world")
})

await connectDB().then(async () => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
})
.catch((error) => console.log(`${error} cannot connect`));

