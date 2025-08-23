import mongoose,{Schema} from  "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const videoschema = new mongoose.Schema(
    {
     videoFile:{
        type:String,// cloudnary url  
        required:true,
     },
     thumbnail:{
        type:String,// cloudnary url  
        required:true,
     },
     title:{
        type:String,
        required:true,
     },
     description:{
        type:String,  
        required:true,
     },
     description:{
        type:Number,// cloudnary url  
        required:true,
     },
     views:{
        type:Number,
        default:0,
     }, 
     isPublished:{
        type:Boolean,
        default:false,
     },
     owner:{
        types:mongoose.Schema.Types.ObjectId,
        ref:"User",
        // required:true,
     }
    },
{timestamps:true})


videoschema.plugin(mongooseAggregatePaginate)

export const   Video = mongoose.model("Video",videoschema)