import {Router} from 'express';
import {registerUser} from '../controllers/user.controller.js';
import {uplode} from "../middleware/multer.middleware.js"



const router = Router();



router.route("/register").post(
    uplode.fields([
        { 
            name: 'avatar', 
            maxCount: 1 
        },
        { 
            name: 'coverImage', 
            maxCount: 1 
        }
    ]),
    registerUser
);

router.route('/register').post(registerUser);

export default router;