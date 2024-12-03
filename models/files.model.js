import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    path:{
        type: String,
        required: true
    },
    orignalName:{
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

export default mongoose.model('File', fileSchema)