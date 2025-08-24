import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js"
import { uplodOnCloudnary } from "../utils/cloudnary.js";
import { ApiReponse } from "../utils/Apiresponce.js";


const registereUser = asynchandler (async(req,res)=>{  
   //get user details
   //validation -not empty
   //chech if user already exist 
   //check for images check for avtar
   //uplod then cloudnary ,avtar
   //creating user object -creating entry in db
   //remove password and  refersh token filed from responce
   //check for user creations
   //ret res
    
   const {username,email, fullName,password} = req.body
//    console.log(usrname,email,fullName,password);


//OLD APPROACH TO CHECK EVERY FEILD
// if(fullName===""){
//     throw new ApiError(400,"Full name is required")
// }

//NEW APPROACH USING .SOME
if(
    [fullName,email,username,password].some(( feild )=>feild?.trim() ==="")
){ throw new ApiError(400 ,"All feild are required")} // in production file there is external files to check the validataion

//checking if user allready exist in database by email or username
const existeduser =  await User.findOne({
    $or:[{username},{email}]
})

if(existeduser){
     throw new ApiError(409,"User with email or username all ready exists")
}
//req.fils come from multer
//avatar[0]=>gives first property
//.path=> gives the path uploded by multer
const avtarLocationPath=req.files?.avatar[0]?.path
// const  coverImageLoacationPath = req.files?.coverImage[0]?.path
let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

if(!avtarLocationPath) throw new ApiError(400,"Avtar file is required");

console.log(avtarLocationPath)

const avatar=  await uplodOnCloudnary(avtarLocationPath)
if(coverImageLocalPath!=""){

 var coverImg= await uplodOnCloudnary(coverImageLocalPath)
}
if(!avatar) throw new ApiError(400,"Avatar file is Required")

const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImg?coverImg.url:"",
    email,
    password,
    username:username.toLowerCase() 
})
const createduser = await User.findById(user._id).select( 
    "-password -refreshToken"
)// select the items you don't want to use by default all are selected.  use '-' sign to remove that

if(!createduser){
    throw new ApiError(500,"AN internal server error while registing user")
}


return res.status(201).json(
        
    new ApiReponse(200,createduser,"User registerd successfully")
)

})


export {registereUser}