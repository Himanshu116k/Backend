import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uplodOnCloudnary } from "../utils/cloudnary.js";
import { ApiReponse } from "../utils/Apiresponce.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registereUser = asynchandler(async (req, res) => {
  //get user details
  //validation -not empty
  //chech if user already exist
  //check for images check for avtar
  //uplod then cloudnary ,avtar
  //creating user object -creating entry in db
  //remove password and  refersh token filed from responce
  //check for user creations
  //ret res

  const { username, email, fullName, password } = req.body;
  //    console.log(usrname,email,fullName,password);

  //OLD APPROACH TO CHECK EVERY FEILD
  // if(fullName===""){
  //     throw new ApiError(400,"Full name is required")
  // }

  //NEW APPROACH USING .SOME
  if (
    [fullName, email, username, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feild are required");
  } // in production file there is external files to check the validataion

  //checking if user allready exist in database by email or username
  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existeduser) {
    throw new ApiError(409, "User with email or username all ready exists");
  }
  //req.fils come from multer
  //avatar[0]=>gives first property
  //.path=> gives the path uploded by multer
  const avtarLocationPath = req.files?.avatar[0]?.path;
  // const  coverImageLoacationPath = req.files?.coverImage[0]?.path
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avtarLocationPath) throw new ApiError(400, "Avtar file is required");

  console.log(avtarLocationPath);

  const avatar = await uplodOnCloudnary(avtarLocationPath);
  if (coverImageLocalPath != "") {
    var coverImg = await uplodOnCloudnary(coverImageLocalPath);
  }
  if (!avatar) throw new ApiError(400, "Avatar file is Required");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImg ? coverImg.url : "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // select the items you don't want to use by default all are selected.  use '-' sign to remove that

  if (!createduser) {
    throw new ApiError(500, "AN internal server error while registing user");
  }

  return res
    .status(201)
    .json(new ApiReponse(200, createduser, "User registerd successfully"));
});

const loginUser = asynchandler(async (req, res) => {
  //req.body ->data
  //username or email
  // find user
  //pasword check
  //access and referesh token
  //send cookies

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }
  const { accessToken, refereshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
      new ApiReponse(
        200,
        {
          user: loggInuser,
          accessToken,
          refereshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refereshtoken", options)
    .json(new ApiReponse(200, {}, "User logged out successfully"));
});

const refereshAccessToken = asynchandler(async (req, res) => {
  const incomingRefershToken =
    req.refereshAccessToken || req.body.refereshAccessToken;
  if (!incomingRefershToken)
    throw new ApiError(401, "Refersh token not found ");
try {
      const decodedToken = jwt.verify(
        incomingRefershToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decodedToken?._id);
      if (!user) {
        throw new ApiError(401, "Invalid refrersh token ");
      }
    
      if (incomingRefershToken !== user?.refreshToken) {
        throw new ApiError(401, "Referesh token is expire or used ");
      }
    
      const options = {
        httpOnly: true,
        secure: true,
      };
    
      const { accessToken, newrefereshToken } =
        await generateAccessAndRefreshTokens(user._id)
          .status(200)
          .clearCookie("accesstoken", options, accessToken)
          .clearCookie("refereshtoken", options, newrefereshToken)
          .json(
            new ApiReponse(
              200,
              { accessToken, refreshToken: newrefereshToken },
              "User logged out successfully"
            )
          );
} catch (error) {
    throw new ApiError(401,error?.message|| "invalid refersh token")
}
});

const changeCurrentPassword = asynchandler(async(req,res)=>{
   
   const {oldpassword,newPassword} = req.body
  const user = await User.findById ( req.body?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)
   if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid password")
   }
   user.password = newPassword 
   await user.save({validateBeforeSave:false});
   return res.status(200).json(new ApiReponse(200,{},"Password changed successfully"))



})


const getCurrentUser = asynchandler(async(req,res)=>
{
  return res
  .status(200)
  .json(200,req.user,"current user fetch successfully")
})

const updateAccountDetails = asynchandler(async(req,res)=>{
  const {fullName ,email}= req.body;
  if(!fullName|| !email){
    throw new  ApiError(404,"All felilds are required")
  }
  const user = await User.findByIdAndUpdate(req.user?._id,
                        {
                          $set:{
                            fullName,
                            email:email
                          }
                        },
                        {new:true}
                        ).select("-password ")
                        return res.status(200).json(new ApiReponse(200,user,"modification is done"))
})

const updateUserAvatar = asynchandler(async(req,res)=>{
  const avtarLocationPath = req.file?.path
  if(!avtarLocationPath) throw new ApiError(400,"Avtar file is required")
    const avatar = await uplodOnCloudnary(avtarLocationPath);
    if(!avatar.url) throw new ApiError(400,"Error while uploding the avatar")
  
     const user = await User.findByIdAndUpdate(req.user?._id,
        {
          $set:{
            avatar:avatar.url
          }
        },
        {new:true}
        ).select("-password ")
        return res.status(200).json(new ApiReponse(200,user,"Avatart is updated"))
})
const updateUserCoverimage = asynchandler(async(req,res)=>{
  const CoverLocationPath = req.file?.path
  if(!CoverLocationPath) throw new ApiError(400,"cover file is required")
    const coverImage = await uplodOnCloudnary(CoverLocationPath);
    if(!coverImage.url) throw new ApiError(400,"Error while uploding the  Cover")
  
     const user= await User.findByIdAndUpdate(req.user?._id,
        {
          $set:{
            coverImage:coverImage.url
          }
        },
        {new:true}
        ).select("-password ")
        return res.status(200).json(new ApiReponse(200,user,"coverimage is updated"))
})


const getUserChanelProfile = asynchandler(async(req,res)=>{
const {username}=  req.params
if(!username) throw new ApiError(400,"username is required")
  const channel = await User.aggregate([
   { 
    $match:{
        username:username?.toLowerCase()
            }
   },
   {
      $lookup:{
             from:"subscriptions"  ,
             localField:"_id",
             foreignField:"channel",
             as:"subscribers"
              }
     },
     {
         $lookup:{
            from:"subscriptions"  ,
             localField:"_id",
             foreignField:"subscriber",
             as:"subscribersTo"
                 }
     },
     {
      $addFields:{
                 subscribersCount:{
                     $size:"$subscribers" 
                    },
                    channelsSubscribedToCount:{
                      $size:"$subscribersTo"
                    },
                    isSubscribed:{
                        $cond:{
                          if:{
                            $in:[req.user?._id,"$subscribers._id.subscriber"]
                          },
                          then:true,
                          else:false
                        
                        }
                    }

                 }
     } ,
     {
      $project:{
        fullName:1,
        username:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1

      }
     }
])
if(!channel?.length){
   throw new ApiError(404,"Channel dose not exist")
}
return res
  .status(200)
  new ApiReponse(200,channel[0],"User chanel fetched  successfully")
})

export { registereUser, loginUser, logoutUser ,refereshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverimage,getUserChanelProfile};
