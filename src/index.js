import mongoose from "mongoose";
import {DB_NAME} from "./constants.js"

import dotenv from "dotenv";
dotenv.config();
// require('dotenv').config({path:'./env'})
import express from "express";
import connectDB from "./db/index.js";
const app = express();

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`📡Server started at PORT 🔐 ${process.env.PORT}`);
    app.on("error",(error)=>{
        console.log("ERROR:",error); 
        throw error;
    })
    })
})
.catch((err)=>{
    console.log("Failed to connect to the database",err);
    process.exit(1);
})




/*

//using IIFE (Immediately Invoked Function Expression) is  a design pattern which is also known as Self-Executing Anonymous Function and contains two major parts. The first is the anonymous function with lexical scope enclosed within the Grouping Operator (). This prevents accessing variables within the IIFE idiom as well as polluting the global scope. The second part creates the immediately invoked function expression () through which the JavaScript engine will directly interpret the function.
//USING SEMICOLON BEFORE IIFE TO AVOID ERRORS IF THE PREVIOUS LINE DOES NOT END WITH A SEMICOLON
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MOMGODB_URL}/${DB_NAME}`);
        console.log("Connected to the database successfully");
        app.on("error",(error)=>{
            console.log("ERROR:",error); 
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`Server started at PORT ${process.env.PORT}`);
        })
    }catch(err){
        console.error("Error while connecting to the database",err);

    }
})()

*/