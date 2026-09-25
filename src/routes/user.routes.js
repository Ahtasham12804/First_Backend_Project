import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { loginUser, logOutUser, refreshAccessToken, changeCurrentPassword,  getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";



const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);


router.route("/login").post(loginUser);


// secured routes
router.route("/logout").post(verifyJWT, logOutUser)  
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account-details").put(verifyJWT, updateAccountDetails)
router.route("/avatar").put(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").put(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router; 