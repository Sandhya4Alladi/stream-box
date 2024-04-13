import User from "../models/User.js";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";
import { uploadVideo, deleteS3Object } from "./videoupload.js";

import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

import Custom from "../models/Custom.js";

export const s3 = new AWS.S3();

AWS.config.update(
  {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  true
);


//To extract Logo Images
export async function extractS3data(bucketName, objectKey) {
  const s3Obj = await s3
    .getObject({
      Bucket: bucketName,
      Key: objectKey,
    })
    .promise();
  const s3ObjData = Buffer.from(s3Obj.Body).toString("base64");
  // console.log(s3ObjData)
  return s3ObjData;
}

//To extract VTTs
export const extractS3Object = async (req, res, next) => {
  const data = decodeURIComponent(req.query.data);
  const Data = JSON.parse(data);

  const params = {
    Bucket: Data.bucketName,
    Key: Data.Key,
  };

  const s3Stream = s3.getObject(params).createReadStream();
  s3Stream.pipe(res);
  res.set("Content-Type", "video/mp4");

  s3Stream.on("error", (err) => {
    console.error("Error streaming video from S3:", err);
  });
};

export const addVideo = async (req, res, next) => {
  try {
    const { videoObjectKey, imageObjectKey, vttObjectKey } = await uploadVideo(req,res);
    const newVideo = new Video({
      userId: req.user.id,
      title: req.body.title,
      desc: req.body.desc,
      imgKey: imageObjectKey,
      videoKey: videoObjectKey,
      captionsKey: vttObjectKey,
      tags: req.body.tags,
    });

    await newVideo.save();
    res.redirect("/videos/success");
  } catch (err) {
    console.error("Error uploading video:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload video." });
  }
};

export const getHomeCards = async (req, res, next) => {
  try {
    const data = await Video.aggregate([{ $sample: { size: 15 } }]);
    res.render("home", { data: data});
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
};

export const getMyVideos = async (req, res, next) => {
  try {
    const data = await Video.find({ userId: req.user.id });
    res.render("myVideo", { data: data});
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
};

export const getMyFav = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.user.id });
    const likedVideos = user.likedVideos;
    const data = [];
    for (let i = 0; i < likedVideos.length; i++) {
      const video = await Video.findById({ _id: likedVideos[i] });
      data.push(video);
    }
    res.render("home", { data: data});
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
};

export const getWatchLater = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.user.id });
    const watchLater = user.watchLater;
    const data = [];
    for (let i = 0; i < watchLater.length; i++) {
      const video = await Video.findById({ _id: watchLater[i] });
      data.push(video);
    }

    res.render("home", { data: data});
  } catch (error) {
    console.error("Error fetching video:", error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).send("Video not found!");
    if (req.user.id === video.userId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedVideo);
    } else {
      return res.status(403).send("You can update only your video!");
    }
  } catch (err) {
    next(err);
  }
};

export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).send("Video Not Found");
    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({message: "Video not found!"});
    const imgKey = video.imgKey;
    const videoKey = video.videoKey;
    const captionsKey = video.captionsKey;
    if (req.user.id === video.userId) {
      console.log("equal");
     const videoId = req.params.id;
      console.log(videoId);
      const result = await User.updateMany(
        {
          $or: [
            { likedVideos: videoId },
            { dislikedVideos: videoId },
            { watchLater: videoId }
          ]
        },
        {
          $pull: {
            likedVideos: videoId,
            dislikedVideos: videoId,
            watchLater: videoId
          }
        }
      );
      console.log(result);
      if (!result || result.nModified === undefined) {
        console.error("Update operation failed or result not as expected:", result);
      }
      await Comment.deleteMany({videoId: videoId})
      .then(result =>{
        console.log(`${result.deletedCount} comments deleted.`)
      })
      .catch((error) => {
        console.error("Error:", error);
      });
      await Video.findByIdAndDelete(req.params.id);
      console.log("video deleted from db");
      await deleteS3Object(process.env.IMAGE_BUCKET, imgKey);
      console.log("image deleted");
      await deleteS3Object(process.env.VIDEO_BUCKET, videoKey);
      console.log("video deleted");
      await deleteS3Object(process.env.VTT_BUCKET, captionsKey);
      console.log("caption deleted");
      res.status(200).json("The video has been deleted");
    } else {
      return res.status(403).json({message: "You can delete only your video!"});
    }
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
};


export const addView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const plays = async(req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.body.id, {
      $inc: { plays: 1 },
    });
  } catch (err) {
    next(err);
  }
}

export const trend = async (req, res, next) => {
  try {
    const data = await Video.find().sort({ views: -1 });
    res.render("home", { data: data});
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
};

export const getByTag = async (req, res, next) => {
  const tag = req.params.tag;
  console.log("tag:", tag);
  try {
    const data = await Video.find({ tags: { $in: tag } }).limit(20);
    //res.status(200).json(videos);
    res.render("home", { data: data});
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => {
  const query = req.query["search"];
  console.log(query);
  if(query===""){
    res.redirect('/home')
  }
  try {
    const videos = await Video.aggregate([
      {
        $search: {
          index: "searchVideo",
          text: {
            query: query,
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);
    // console.log(videos)
    res.render("home", { data: videos});
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    // Fetch video analytics data from MongoDB
    const videoAnalytics = await Video.find(
      { userId: req.user.id },
      "title views plays likes dislikes"
    );

    let videoinfo = [];
    for (let i = 0; i < videoAnalytics.length; i++) {
      const eachvideoinfo = {
        title: videoAnalytics[i].title,
        views: videoAnalytics[i].views,
        plays: videoAnalytics[i].plays,
        likes: videoAnalytics[i].likes,
        dislikes: videoAnalytics[i].dislikes,
      };
      videoinfo.push(eachvideoinfo);
    }

    // Calculate overall totals
    const overall = {
      totalViews: videoAnalytics.reduce((total, video) => total + video.views, 0),
      totalPlays: videoAnalytics.reduce((total, video) => total + video.plays, 0),
      totalLikes: videoAnalytics.reduce((total, video) => total + video.likes, 0),
      totalDisLikes: videoAnalytics.reduce((total, video) => total + video.dislikes, 0),
    };

    // Render the analytics view with the data
    res.render("analytics", {
      videoinfo: JSON.stringify(videoinfo),
      overall: JSON.stringify(overall),
      n: videoinfo.length,
    });
  } catch (error) {
    // console.error("Error fetching video analytics:", error);
    res.status(500).json({ success: false, message: "Error fetching video analytics" });
  }
};


export const getPlaybackPosition = async (req, res) => {
  try {
    const { videoId } = req.params;
    const playbackPosition = req.session[`playbackPosition_${videoId}`] || 0;
    console.log(
      `Playback position for video ${videoId} retrieved: ${playbackPosition}`
    );
    res.status(200).json({ playbackPosition: playbackPosition });
  } catch (error) {
    console.error("Error retrieving playback position from session:", error);
    res.status(500).json({ error: "Failed to retrieve playback position" });
  }
};

export const storePlaybackPosition = (req, res) => {
  try {
    const { videoId } = req.params;
    const playbackPosition = req.body.playbackPosition;
    req.session[`playbackPosition_${videoId}`] = playbackPosition;
    req.session.save();
    res.sendStatus(200);
  } catch (err) {
    console.error("Error storing playback position tosession:", err);
    res.status(500).json({ error: "Failed to set playback position" });
  }
};