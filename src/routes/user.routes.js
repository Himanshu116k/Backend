import { Router } from "express";
import { registereUser } from "../controllers/user.controller.js";
import{upload} from "../middlewares/multer.middlerware.js"


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




export default router;  //when we use export default then we can import file by any name.