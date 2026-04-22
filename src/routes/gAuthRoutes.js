import express from "express"
import axios from "axios"
import { OAuth2Client } from "google-auth-library";
import {googleAuth,googleCallback,logOut,getMe} from "../controller/googleAuthController.js"
import {authMiddleware} from "../middleware/authMiddleware.js"


const router=express.Router();
const client = new OAuth2Client(process.env.CLIENT_ID);

router.get('/auth/google',googleAuth)

router.get("/auth/google/callback",googleCallback )

router.get("/profile",authMiddleware,getMe)

router.post("/logout",logOut)

export default router;