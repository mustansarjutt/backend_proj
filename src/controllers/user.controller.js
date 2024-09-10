import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log("Email: ", email)

    // 2. authentication
    // checking if any filed is empty
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    // 3. checking if user already present
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(409, "User already exist");
    }

    // 4. checking if files are present
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
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

    if (isUserCreated) {
        throw new ApiError(500, "Something went wrong while registring the user");
    }

    // 9. send response

    return res.status(201).json(
        new ApiResponse(200, isUserCreated, "User Registered Successfully")
    );

});

export { registerUser }