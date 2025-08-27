import { Router } from "express";
import { registereUser,loginUser, logoutUser,refereshAccessToken } from "../controllers/user.controller.js";
import{upload} from "../middlewares/multer.middlerware.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([
          {
            name:"avatar",//fronted name should be avtar
            maxCount:1
          },
          {
            name:"coverImage",//fronted name should be avtar
            maxCount:1
          }
    ]),
    registereUser)

    router.route("/login").post(loginUser)
    //secure routes
  router.route('/logout').post(verifyJWT,logoutUser)
  router.route("/refersh-token").post(refereshAccessToken)




export default router;  //when we use export default then we can import file by any name.