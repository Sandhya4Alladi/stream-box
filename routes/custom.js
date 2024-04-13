import express from "express";
import { verifyToken } from "../verifyToken.js";
import { addCustoms, getCustoms } from "../controllers/custom.js";
import {upload} from "../controllers/videoupload.js"

const router = express.Router();

router.get("/", verifyToken, getCustoms);
router.post("/update", verifyToken,  upload.single('imageFile'), addCustoms);

export default router;