import express from "express";
import { update, deleteUser, getUser, like, dislike, watch, trackStatus, checkStatus } from "../controllers/user.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

router.put("/:id", verifyToken, update)

router.delete("/:id", verifyToken, deleteUser)

router.get("/find", verifyToken, getUser)

router.post("/like", verifyToken, like)

router.post("/dislike", verifyToken, dislike);

router.post("/watch", verifyToken, watch)

router.get("/track/:id", verifyToken, trackStatus);

router.get("/status/:id", verifyToken, checkStatus);

router.put("/dislike/:videoId", verifyToken, dislike);

export default router;