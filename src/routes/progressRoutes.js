import express from "express"
import {authMiddleware} from "../middleware/authMiddleware.js"
import {getUploadUrls,logSubmit,getProgress} from "../controller/uploadController.js"
const router=express.Router()



router.post("/submit-notes",authMiddleware,getUploadUrls)

router.post("/log-submit",authMiddleware,logSubmit)

router.get("/history",authMiddleware,getProgress)

// router.post("/submit-dpp",authMiddleware,)
export default router