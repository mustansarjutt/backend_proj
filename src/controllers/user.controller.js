import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const options = {
    httpOnly: true,
    secure: true
}

// 1. get user details from frontend (postman in this case)
// 2. validation - not empty
// 3. check if user already exist (username, email)
// 4. check if files are present (avatar)
// 5. upload to cloudianry
// 6. create user object - create db entry
// 7. remove pw and ref token field
// 8. check for user creation
// 9. return res - based upon succession

const registerUser = asyncHandler(async (req, res) => {
    // 1. data from form and json - found from body
    const { fullName, email, username, password } = req.body;
    // console.log("Email: ", email);

    // 2. authentication
    // checking if any filed is empty
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    // 3. checking if user already present
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(409, "User already exist");
    }
    // console.log(req.files);

    // 4. checking if files are present
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 5. upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Failed to upload");
    }

    // 6. entry to db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });
    // 7. check for creatation
    // 8. remove pw and ref token
    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong while registring the user");
    }

    // 9. send response

    return res.status(201).json(
        new ApiResponse(200, isUserCreated, "User Registered Successfully")
    );

});

const loginUser = asyncHandler(async (req, res) => {
    // 1. req body se data lena
    // 2. username/email hai ya nhi
    // 3. find the user
    // if (yes) --> pw check
    // else --> end
    // after pw check access and refresh token gen and send user via cookies
    // send res that logged in

    const { email, username, password } = req.body;
    // this is the alternate the other
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or password");
    // }
    if (!username && !email) {
        throw new ApiError(400, "username or password required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (!user) {
        throw new ApiError(404, "user does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggenInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggenInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refereshToken: undefined
            }
        },
        {
            new: true
        }
    );

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refereshAccessToken = asyncHandler(async (req, res) => {
    // 2nd case is for mobile app
    const incomingRefToken = req.cookies.refereshToken || req.body.refreshToken;
    if (!incomingRefToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
    
        if (!user) {
            throw new ApiError(401, "Invalid referesh token");
        }
        if (incomingRefToken !== user?.refereshToken) {
            throw new ApiError(401, "Referesh token is invalid or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { newAccessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    newAccessToken,
                    newRefreshToken
                },
                "Access token refereshed"
            )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid referesh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // we can check the confirm pw, but it can be done on frontend
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isCorrect) {
        throw new ApiError(400, "Wrong password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user fetched")
    );
});

const updateAccoutDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {

            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password -refereshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User details updated successfully")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar updated successfuly")
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        new ApiError(400, "Avatar file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image updated successfuly")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccoutDetails,
    updateAvatar,
    updateCoverImage
}