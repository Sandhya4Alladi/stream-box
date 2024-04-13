import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()
 
export const verifyToken=(req,res,next)=>{
  const token=req.cookies.access_token;
  if(token){
      jwt.verify(token, process.env.JWT_SECRET_KEY,(err, user) =>{
          if(err){
              res.redirect("/auth/signin")
          }
          else{
            req.user= {id:user.id, username:user.username}
              next();
          }
      })
  }
  else{
      res.redirect("/auth/signin");
  }
}
 