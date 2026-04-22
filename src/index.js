import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser";

import dotenv from 'dotenv'
import {connectDB} from "./config/dbConfig.js"
import gAuthRoutes from "./routes/gAuthRoutes.js"
import progressRoutes from "./routes/progressRoutes.js"

dotenv.config();

const app=express();
app.use(cors({
    origin:process.env.API,
    credentials:true
}))

app.use(cookieParser());
app.use(express.json());

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));



app.get('/ping',(req,res)=>{
    res.send("Hello from server pong.")
})

app.use(gAuthRoutes)
app.use(progressRoutes)


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on PORT :${process.env.PORT}`)
    connectDB()
})

