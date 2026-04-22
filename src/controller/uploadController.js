
import { PutObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Config.js";
import crypto from "crypto";

import User from "../schema/userSchema.js"
import Progress from "../schema/progressSchema.js"

export const getUploadUrls = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { files } = req.body || {};

    if (!files) {
      return res.status(400).json({ error: "Files missing" });
    }
  

    const date = new Date().toISOString().split("T")[0];

    const uploads = await Promise.all(
      files.map(async (file) => {
        const uniqueId = crypto.randomUUID();

        const key = `${userId}/${date}/${file.type}/${uniqueId}_${file.name}`;

        console.log(file.type)

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          ContentType: file.contentType,
        });

        const uploadUrl = await getSignedUrl(s3, command, {
          expiresIn: 1800,
        });

        const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return {
          uploadUrl,
          key,
          type: file.type,
        };
      })
    );

    res.json({ uploads });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Upload URL error" });
  }
};

export const logSubmit=async(req,res)=>{
    try{
        const userId=req.user.userId
        console.log(userId)
        const {subject,topic,notesUrls=[],dppUrls=[]}=req.body
        
     // 1. VALIDATION
    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }

    if (!topic && notesUrls.length === 0 && dppUrls.length === 0) {
      return res.status(400).json({
        error: "Provide topic or at least one file",
      });
    }

    // 2. DATE (IMPORTANT FOR STREAK + GROUPING)
      const date = new Date().toLocaleDateString("en-CA");
      
      console.log(date)

    // 3. UPSERT (NO DUPLICATE PER DAY + SUBJECT)
    const progress = await Progress.findOneAndUpdate(
      { userId, date, subject },
      {
        topic,
        notesUrls,
        dppUrls,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // 🟢 4. RESPONSE
    res.status(200).json(progress);

    }catch(error){
        console.log(error,"Error from logSubmit")
        res.status(500).json({ error: "Server error while saving progress" });
    }
}

// controllers/progressController.js

// export const getProgress = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { subject } = req.query;

//     if (!subject) {
//       return res.status(400).json({ error: "Subject is required" });
//     }

//     const history = await Progress.find({ userId, subject })
//       .sort({ date: -1 });

//     res.status(200).json(history);

//   } catch (error) {
//     console.error("Fetch History Error:", error);
//     res.status(500).json({ error: "Server error while fetching history" });
//   }
// };  

export const getProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }

    const history = await Progress.find({ userId, subject })
      .sort({ date: -1 });

    // 🔥 Convert keys → signed URLs
    const historyWithUrls = await Promise.all(
      history.map(async (item) => {
        const notesUrls = await Promise.all(
          item.notesUrls.map(async (key) => {
            const command = new GetObjectCommand({
              Bucket: process.env.S3_BUCKET,
              Key: key,
            });

            return await getSignedUrl(s3, command, {
              expiresIn: 3600, // 1 hour
            });
          })
        );

        const dppUrls = await Promise.all(
          item.dppUrls.map(async (key) => {
            const command = new GetObjectCommand({
              Bucket: process.env.S3_BUCKET,
              Key: key,
            });

            return await getSignedUrl(s3, command, {
              expiresIn: 3600,
            });
          })
        );

        return {
          ...item._doc,
          notesUrls,
          dppUrls,
        };
      })
    );

    res.status(200).json(historyWithUrls);

  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({ error: "Server error while fetching history" });
  }
};