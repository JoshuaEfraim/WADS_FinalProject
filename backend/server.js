import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js"


dotenv.config()

const app = express();
const port = process.env.PORT;


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

