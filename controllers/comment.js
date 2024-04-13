import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import User from "../models/User.js";

export const addComment = async (req, res, next) => {
    const desc = req.body.comment;
    const user = await User.findOne({_id: req.user.id})
    const videoId = req.params.id;
    try{
        const newComment = new Comment({userId: user._id, username : user.username, videoId: videoId, desc: desc})
        const savedComment = await newComment.save();
        return res.status(200).send(savedComment);
    }catch(err){
        next(err);
    }
};

export const deleteComment = async (req, res, next) => {
    try{
        const comment = await Comment.findOne({_id:req.params.id});
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        const video = await Video.findOne({_id:comment.videoId});
        if (!video) {
            return res.status(404).json({ message: 'Video not found.' });
        }
        if(req.user.id === comment.userId || req.user.id === video.userId){
            await Comment.findByIdAndDelete(req.params.id);
            res.status(200).json("Comment deleted.");
        }else{
            res.status(403).json({message: 'You can delete only your comment!'})
        }
    }catch(err){
        next(err);
    }
};

export const getComments = async (req, res, next) => {
    try{
        const comments = await Comment.find({videoId: req.params.id});
        res.status(200).json(comments);
    }catch(err){
        next(err);
    }
};