import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Custom from "../models/Custom.js";
dotenv.config()

export const signup = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.session.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newUser = new User({
      username: name,
      email: email,
      password: hashedPassword,
    });

    await newUser.save();
    const user = await User.findOne({username: name})
    const newCustom = new Custom({
      userId: user._id,
    })

    await newCustom.save();
    //res.status(200).send("User has been created!");
    res.redirect("/auth/signin");
  } catch (err) {
    // console.log(err);
    next(err);
  }
};


export const verifyEmail = async (req, res, next) => {
  try{
    const useremail = req.body.email;
    req.session.email = useremail;
    console.log(useremail)
    const user = await User.findOne({ email: useremail });
     if (user) 
      return res.status(409).json({message: 'usera already exists'});

    const name= useremail.split('@')[0]

    const otp = generateRandomNumber();
    console.log(otp)
    req.session.otp = otp;

    req.session.save();
    const subject = "OTP to verify your email id";
    const html = `<p>Dear ${name}, <br><br></p><p> Your One Time Password to verify your email id is <b>${otp}<b></p> <br>Warm Regards,<br><b>TEAM STREAMBOX.</b>`;

    if(!sendOTP(useremail, subject, html)){
      res.send("Error sending email");
    }else{
      res.status(200).json({message: "Email sent"})
    }
  }catch(err){
    console.log(err)
    next(err);
  }
}

export const usernameExists = async (req,res,next) => {
  const username = req.body.username;
  try{
    const user = await User.findOne({username: username});
    if (user) {
      res.status(400).json({ message: 'Username is already taken' });
    }else {
      res.status(200).json({ message: 'Username is available' });
    }
  }catch(err){
    console.log(err);
  }
}

export const signin = async (req, res, next) => {
  const token = req.cookies.access_token;
  if(token){
    res.redirect('/home');
  }else{
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({message: "User not found!"});
 
    const isCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isCorrect) return res.status(400).json({message: "Wrong Credentials"});
 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
    const { password, ...others } = user._doc;
 
    res
      .cookie("access_token", token, {
         httpOnly: true,
      })
      .status(200)
      .json({message: "User Validated"})
  } catch (err) {
    //res.status(404)
    next(err);
  }
  }
};

function generateRandomNumber() {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  return randomNumber.toString();
}

const sendOTP = async(useremail, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: process.env.SENDER_EMAIL_ID,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL_ID,
    to: useremail,
    subject: subject,
    html: html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return 0
    } else {
      console.log("Email sent: " + info.response);
      return 1;
    }
  });
}

export const forgotPW = async (req, res, next) => {

  const useremail = req.body.email;
  req.session.email = useremail;

  const user = await User.findOne({ email: useremail });
  if (!user) return res.status(404).json({message: "User not found!"});

  const name= useremail.split('@')[0]

  const otp = generateRandomNumber();
  req.session.otp = otp;
  console.log(req.session);

  const subject = "OTP to change your StreamBox Password";
  const html = `<p>Dear ${name}, <br><br></p><p> Your One Time Password to verify your login id and change your STREAMBOX password is <b>${otp}<b></p> <br>Warm Regards,<br><b>TEAM STREAMBOX.</b>`;

  if(sendOTP(useremail, subject, html)){
    res.redirect("/auth/otp")
  }else{
    res.send("Error sending email");
  }
};


export const validateOTP = async (req, res, next) => {

  const { d1, d2, d3, d4, d5, d6 } = req.body;
  const otp = req.session.otp;
  const param_otp = d1*100000 + d2*10000 + d3*1000 + d4*100 + d5*10 +d6*1;

  if (Number(otp) === param_otp) {
    console.log('otp validated')
    res.status(200).json({message:"OTP Validated"});
  } else {
    res.status(500).json({message:"Invalid OTP"});
  }
};

export const resetPW = async (req, res, next) => {
  if (req.body.password === req.body.confirm_password){
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { email : req.session.email},
      {password: hashedPassword}
     )
     .catch((error) => {
      console.error('Error updating user:', error);
     });
     res.redirect('/auth/signin');
  }else{
    res.send("Try Again, Confirm Password is not same as Password given")
  }
};

export const logout =  (req, res) => {
  res.clearCookie('access_token'); 
  req.session.destroy((err) => {
    if (err) {
      // console.error("Error destroying session:", err);
      return res.status(500).send("Internal server error");
    }else{
      res.redirect("/auth/signup");
    }
  });
}