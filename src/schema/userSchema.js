import mongoose from "mongoose"
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    profile:{
        type:String
    },
    provider:{
        type:String,
        enum:["google"],
        default:"google",

    },
    providerID:{
        type:String,
        required:true,
        unique:true,

    },
    lastLoggedIN:{
        type:Date,
        default:Date.now,
    }

},{timestamps:true,})

const User=mongoose.model('User',userSchema)
export default User