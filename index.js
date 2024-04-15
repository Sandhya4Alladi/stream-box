import express from "express";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import userRoutes from "./routes/users.js";
import videoRoutes from "./routes/videos.js";
import commentRoutes from "./routes/comments.js";
import authRoutes from "./routes/auth.js";
import customRoutes from "./routes/custom.js";

import { verifyToken } from "./verifyToken.js";
import { getHomeCards } from "./controllers/video.js";

import session from 'express-session';

const app = express();



app.use(session({
  secret: process.env.SESSION_SECRET_KEY, 
  resave: true,
  saveUninitialized: true,
}));

app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs')

app.use('/static',express.static(path.join(__dirname,'public')))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

dotenv.config();

app.get("/",(req, res) => {
  const token = req.cookies.access_token;
  if(!token) 
    res.redirect('/auth/signup'); 
  else
    res.redirect("/home")
});


app.get("/embed", (req,res) => {
  console.log(req.query.key);
  res.render("embed", {key: req.query.key})
});

app.get("/video-quality", verifyToken, (req,res) => {
  res.render("video-quality");
});

app.get("/home",  verifyToken, getHomeCards)

const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      throw err;
    });
}




app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/videos", videoRoutes);
app.use("/comments", commentRoutes);
app.use("/customs", customRoutes)
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});



const port = 2000;

app.listen(port, () => {
  try {
    connect();
    console.log("Connected to server");
    console.log(`http://localhost:${port}`);
  } catch {
    console.log(err);
  }
});