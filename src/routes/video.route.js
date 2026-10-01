import { Router } from "express";
import { publishAVideo, getVideoById, updateVideo} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();
router.use(verifyJWT)

router.route("/publish").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);


router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(updateVideo);
export default router; 
