import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js"
import cors from "cors";


dotenv.config()

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};

const app = express();
const port = process.env.PORT;

// Enable CORS for all origins (for development)
// For production, set origin: 'https://your-frontend-domain.com'
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/admin", adminRoutes)
app.use("/api/tickets", ticketRoutes)

app.get("/", (req,res,next) =>{
    res.send("hello world")
})

await connectDB().then(async () => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
})
.catch((error) => console.log(`${error} cannot connect`));

