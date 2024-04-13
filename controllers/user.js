import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Video from "../models/Video.js"
import { deleteS3Object } from "./videoupload.js";

export const update = async (req,res,next) => {
    if(req.params.id === req.user.id){
        try{
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set:req.body,
                },
                {new: true}
                );
            res.status(200).json(updatedUser)
        }catch(err){
            next(err)
        }
    }else{
        return res.status(403).json({message: "You can update only your account!"});
    }
};

async function delete_video_from_s3(videos){
    for(let i=0;i<videos.length;i++){
    await deleteS3Object(process.env.IMAGE_BUCKET, videos[i].imgKey);
    await deleteS3Object(process.env.VIDEO_BUCKET, videos[i].videoKey);
    await deleteS3Object(process.env.VTT_BUCKET, videos[i].captionsKey);
    }
}

export const deleteUser = async (req,res,next) => {
    if (req.params.id === req.user.id) {
        try {
            let videos_to_del;
            await Video.find({ userId: req.user.id })
                .then(videos => {
                    videos_to_del =videos;
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
            console.log("videos to delete",videos_to_del);
            await delete_video_from_s3(videos_to_del);
            await Video.deleteMany({ userId: req.user.id})
                .then((result) => {
                    console.log(`${result.deletedCount} videos deleted`);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
            const data = await User.findByIdAndDelete(req.params.id);
            if (!data) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({ message: 'Account deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }else{
        return res.status(403).json({message:"You can delete only your account!"});
    }
};

export const getUser = async (req,res,next) => {
    try{
        const user = await User.findById(req.user.id);
        res.render("profile",{user: user})
        //res.status(200).json(user);
    }catch(err){
        next(err)
    }
};

export const like = async (req, res, next) => {
    // console.log(req.body.id);
    try {
        const liked = await User.findOne({ _id: req.user.id, likedVideos: { $in: [req.body.id] } });
        const disliked = await User.findOne({ _id: req.user.id, dislikedVideos: { $in: [req.body.id] } });
        if (disliked) {
            await User.findByIdAndUpdate(req.user.id, {
                $pull: { dislikedVideos: req.body.id},
                })
            await Video.findByIdAndUpdate(req.body.id, {
                $inc : {dislikes : -1}
            })
        }
        if(!liked){
            await User.findByIdAndUpdate(req.user.id, {
                $addToSet: { likedVideos: req.body.id },
            });
            await Video.findByIdAndUpdate(req.body.id, {
                $inc : {likes : 1}
            })
        }
        res.status(200).json("The video has been liked.");
    } catch (err) {
        next(err);
    }
};
 
 
export const dislike = async (req, res, next) => {
    try {
        const liked = await User.findOne({ _id: req.user.id, likedVideos: { $in: [req.body.id] } });
        const disliked = await User.findOne({ _id: req.user.id, dislikedVideos: { $in: [req.body.id] } });
        if (liked) {
            await User.findByIdAndUpdate(req.user.id, {
                $pull: { likedVideos: req.body.id},
                })
            await Video.findByIdAndUpdate(req.body.id, {
                $inc : {likes : -1}
            })
        }
        if(!disliked){
            await User.findByIdAndUpdate(req.user.id, {
                $addToSet: { dislikedVideos: req.body.id },
            });
            await Video.findByIdAndUpdate(req.body.id, {
                $inc : {dislikes : 1}
            })
        }
        res.status(200).json("The video has been disliked.")
    } catch (err) {
        next(err)
    }
};

export const watch = async (req, res, next) => {
    const userId = req.user.id;
    const videoId = req.body.id;
    // console.log(userId, videoId)
    try {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { watchLater: videoId },
       
        });
        //res.status(200).json("The video has been added to watch later.");
      } catch (err) {
        next(err);
      }
}

export const trackStatus = async (req, res, next) =>{
    try{
        const watched = await User. findOne({_id:req.user.id, watchLater:{$in:[req.params.id]}})
        if(watched) res.status(200).json({watched:1})
        else res.status(200).json({watched:0});
    }
    catch (err) {
        res.status(500).json({ error: err.message }); // Respond with status 500 and error message if an error occurs
    }
}

export const checkStatus = async (req, res, next) => {
    try{
        // console.log("isliked controller")
        const liked = await User.findOne({_id: req.user.id, likedVideos: {$in: [req.params.id]}})
        const disliked = await User.findOne({_id: req.user.id, dislikedVideos: {$in: [req.params.id]}})
        // console.log(liked);
        if(liked) res.status(200).json({liked: 1, disliked: 0})
        else if(disliked) res.status(200).json({liked: 0, disliked: 1})
        else res.status(200).json({liked:0, disliked: 0})
    }catch(err){
        // console.log(err);
        res.status(400)
    }
}