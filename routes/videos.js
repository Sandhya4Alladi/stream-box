import express from "express";
import { addVideo, deleteVideo, trend, addView, plays, getByTag, search, getHomeCards, getMyVideos, getMyFav,  extractS3Object, getWatchLater, getAnalytics, getPlaybackPosition, storePlaybackPosition, extractS3data } from "../controllers/video.js";
import { verifyToken } from "../verifyToken.js";

import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {upload} from "../controllers/videoupload.js"
import { watch } from "../controllers/user.js";
import Custom from "../models/Custom.js";
import Video from "../models/Video.js";

const router = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.get('/', verifyToken, (req, res) => {
   res.redirect("/home")
})

router.get("/uploadvideo", verifyToken, (req,res) => {
   res.render("uploadvideo");
});

router.get("/success", verifyToken, (req,res) => {
   res.render("success")
})

router.post("/uploadvideo", verifyToken, upload.fields([
    {name: 'videoFile' , maxCount:1},
    {name: 'imageFile' , maxCount:1}
]),addVideo)

router.get('/playvideo', verifyToken, async (req, res) => {
   const custom = await Custom.findOne({userId: req.user.id});
   const logo = await extractS3data(process.env.LOGO_BUCKET, custom.logo);
   res.render('player', {key: req.query.data, id: req.query.id, custom: JSON.stringify(custom), logo:logo });
});

router.get('/stream', verifyToken, extractS3Object)

router.get('/myvideos', verifyToken, getMyVideos)

router.get('/likedVideos', verifyToken, getMyFav)

router.get('/watchLater', verifyToken, getWatchLater)

router.post("/watch", verifyToken, watch)

router.post("/add", verifyToken, addVideo)

router.delete("/:id", verifyToken, deleteVideo)

router.put("/view/:id",addView)

router.put("/plays", verifyToken, plays);

router.get("/trend",trend)

router.get("/tags/:tag", getByTag)

router.get("/search", search)

router.get('/analytics', verifyToken, getAnalytics)

router.get("/embed", verifyToken, (req,res) => {
   res.render("embed")
});

router.post('/playbackposition/:videoId', verifyToken, storePlaybackPosition);
 
router.get('/playbackposition/:videoId', verifyToken, getPlaybackPosition);

export default router;