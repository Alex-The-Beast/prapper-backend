import mongoose from "mongoose"

export const  connectDB= async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to db successfully")

    }catch(err){
        console.log("getting error in db conncetion ."+err)
    }
}