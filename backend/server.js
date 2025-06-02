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
app.use(express.json());
const port = process.env.PORT;

// Enable CORS
app.use(cors({
    origin: "https://e2425-wads-l4ccg1-client.csbihub.id",
    credentials: true,
}));

// Add cookie parser middleware
app.use(cookieParser());

// Add session middleware
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 24 * 60 * 60 * 1000 // 1 day
//     }
// }));

app.use(passport.initialize());
app.use(passport.session());


app.use("/api/admin", adminRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/user", usersRoute)

app.get("/", (req,res,next) =>{
    res.send("hello world")
})

await connectDB().then(async () => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
})
.catch((error) => console.log(`${error} cannot connect`));

