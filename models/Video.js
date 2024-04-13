import mongoose from "mongoose";
 
const VideoSchema =  mongoose.Schema(
    {
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    imgKey: {
        type: String,
        required: true,
    },
    videoKey: {
        type: String,
        required: true,
    },
    captionsKey:{
        type: String,
        required: true,
    },
    tags:{
        type: [String],
        default:[],
    },
    views: {
        type: Number,
        default: 0,
    },
    plays:{
        type: Number,
        default: 0,
    },
    likes:{
        type: Number,
        default:0,
    },
    dislikes:{
        type: Number,
        default:0,
    }
    },
    {timestamps: true}
);
 
export default mongoose.model("Video", VideoSchema);