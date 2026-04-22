import jwt from "jsonwebtoken"
export const authMiddleware=(req,res,next)=>{
 const token=req.cookies.token;
 if(!token){
    return res.status(401).json({
        message:"User Not Logged In"
    })
 }
 try{
    console.log(token)
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    console.log(decoded,"decode data from auth middleware.")
    req.user=decoded;
    next();

 }catch(error){
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
        message:"Invalid Token."
    })
 }
}