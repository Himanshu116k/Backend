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

export { registereUser, loginUser, logoutUser ,refereshAccessToken};
