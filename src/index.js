// require("dotenv").config({path: "./env"});

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: "./.env"
});






app



connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT }`);
    })
    app.on("error", (error) => {
        console.error("Connection error:", error);
        throw error;
    });
    
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});









/*
import express from "express";
const app = express();


( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
        app.listien(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})()
*/


