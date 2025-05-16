import express from "express";
import dotenv from "dotenv";

dotenv.config()

const app = express();
const port = process.env.PORT;

app.get("/", (req,res,next) =>{
    res.send("hello world")
})

app.listen(port, async () =>{
    console.log(`Listening on port ${port}`);

})