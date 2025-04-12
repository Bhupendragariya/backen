import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiEror.js";
import { User } from "../models/user.models.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import { apiRespons } from "../utils/apiRespons.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something is went wrong while generating rferesh and access token "
        );
    }
};

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

    const { fullName, email, username, password } = req.body;
    console.log("email", email);

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // console.log( req.files)

    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // const avatarLocalPath = req.files?.avatar[0].path;
    const avatarLocalPath = req.files?.avatar[0].path;
    // const coverimageLocalPath = req.files?.coverImage[0]?.path;

    let coverimageLocalPath;

    if (
        req.files?.coverImage &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverimageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
        // return res.status(400).json({ message: "Avatar is required!" });
    }

    const avatar = await uploadToCloudinary(avatarLocalPath, "avatar");
    const coverImage = await uploadToCloudinary(
        coverimageLocalPath,
        "coverImage"
    );

    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar to cloudinary");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
        email,
        password,
        username: username.toLowerCase(),
    });

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createUser) {
        throw new ApiError(500, "somthing went wrong while registering user");
    }

    return res
        .status(201)
        .json(new apiRespons(200, createUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // req body --> data
    // username or email
    // find the user
    // password check
    // access and refresh
    // sen cookies

    const { email, username, password } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new Error(401, "invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password  -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiRespons(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user logged in successfully "
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiRespons(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler( async(req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken) {
       throw new ApiError(401, "unauthorized request")
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
    const user = User.findById(decodedToken.id)
     if(!user) {
          throw new ApiError(401, "invalid refresh  token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "refresh token is not valid")
     }
 
 
     const options = {
         httpOnly: true,
         secure: true,
     };
 
     const{accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
     return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
             new apiRespons(
                 200,{
                        accessToken,
                        refreshToken: newRefreshToken,
                 },
                 "new access token refreshed successfully"
             )
         );
   } catch (error) {
         throw new ApiError(401, "invalid refresh token")
    
   }




})

export { registerUser, loginUser, logoutUser, refreshAccessToken };

