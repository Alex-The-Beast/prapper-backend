import mongoose from "mongoose"

const progressSchema=new mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
   },
   date:{
    type:String,
    required:true
   },
   subject:{
    type:String,
    required:true
   },
   topic:{
    type:String,
    required:true
   },
   notesUrls:{
    type:[String],
    default:[],
   },
   dppUrls:{
    type:[String],
    default:[],
   }
},
    {timestamps:true})

    // indexes
    progressSchema.index({userId:1,date:1})
    progressSchema.index({userId:1,date:1,subject:1},{unique:true})

const Progress= mongoose.model('Progress',progressSchema)
export default Progress