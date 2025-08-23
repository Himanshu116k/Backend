import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB  = async()=>{
    try{
      const connectionInstance =   await mongoose.connect(`${process.env.MOMGODB_URL}/${DB_NAME}`)
        console.log("connection to database is succesfull")
        console.log(`the connection instance is ${connectionInstance.connection.host}`)

    }catch(err){
        console.error("Error while connecting to database",err);
        process.exit(1)
    }
}

export default connectDB;