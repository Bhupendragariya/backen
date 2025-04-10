import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiEror.js";
import {User} from "../models/user.models.js";
import  uploadToCloudinary  from "../utils/cloudinary.js";
import { apiRespons } from "../utils/apiRespons.js";


const registerUser = asyncHandler(async (req, res) => {
   //get user details from frontend
   //validation -ont empty
   //check if user already exists
   // check for image, check for avatar
   //upload them to cloudinary, avatar 
   // create user object - create entery in db
   // remove password and refresh token fields from response
   // check for user creation success fully
   // return response

   const { fullName, email, username, password  } = req.body;
   console.log("email", email);

   if ([fullName, email, username, password].some((field) =>  
   field?.trim() === "" )
 ) {
      throw new  ApiError(400, "All fields are required");
   }

   const existedUser = User.findOne({ 
      $or: [  {email},  {username}  ]
    })

    if (existedUser) {
      throw new ApiError(409, "User already exists")
    }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverimageLocalPath = req.files?.coverImage[0]?.path;


   if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required")
   }

   const avatar = await uploadToCloudinary(avatarLocalPath);
   const coverImage =  await uploadToCloudinary(coverimageLocalPath) ;

   if (!avatar) {
      throw new ApiError(500, "Error uploading avatar to cloudinary")
   }

   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || null,
      email,
      password,
      username: username.toLowerCase(),
   })

   const createUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if (!createUser) {
      throw new ApiError(500, "somthing went wrong while registering user")
   }

   return res.status(201).json(
      new apiRespons(200, createUser,  "User created successfully", )
   )
   

})

export { registerUser };