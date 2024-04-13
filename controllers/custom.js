import Custom from "../models/Custom.js";
import { extractS3data } from "./video.js";
import { deleteS3Object, uploadFile } from "./videoupload.js";
import {v4 as uuidv4} from 'uuid';

export const addCustoms = async(req, res, next) => {
    try{
        const pres_custom = await Custom.findOne({userId: req.user.id});
        let logoObjectKey = 'default-logo.jpg';
        if(pres_custom.logo != 'default-logo.jpg'){
            logoObjectKey = pres_custom.logo;
        }
        if(req.file){
            const logoName = (req.file.originalname).replace(/ /g, "");
            const logoId = uuidv4();
            const logoData = req.file.buffer;
            console.log(logoObjectKey, logoData)
            if(logoObjectKey!='default-logo.jpg')
                await deleteS3Object('streambox-logos', logoObjectKey);
            logoObjectKey = `${req.user.id}-${logoId}-${logoName}`;
            await new Promise((resolve, reject) => {
                uploadFile(process.env.LOGO_BUCKET, logoObjectKey, logoData, "image/png",(err, logoURL) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        console.log("Logo Uploaded Successfully!");
                        resolve(logoURL);
                    }
                });
            });
        }

        const color = req.body.color;
        const theme = req.body.theme;
        console.log(req.body)
        console.log(color,theme);
        const custom = await Custom.findOneAndUpdate({
            userId : req.user.id},{
            logo : logoObjectKey,
            playerColor : color,
            theme : theme,
        },{
            upsert: true,
            new: true
        });
        console.log(custom);
        res.redirect('/customs');
    }catch(err){
        // console.log(err);
        next(err);
    }
}


export const getCustoms = async(req, res, next) => {
    try{
        const custom = await Custom.findOne({userId: req.user.id});
        console.log("custom:", custom)
        if(!custom){
            const newCustom = new Custom({
                userId: req.user.id,
            });
            console.log("newcustom:", newCustom)
            await newCustom.save();
            const imgData = await extractS3data('streambox-logos', 'default-logo.jpg');
            res.render("player-settings", {userCustom: newCustom, logo: imgData});
        }else{
            const imgData = await extractS3data('streambox-logos', custom.logo);
            res.render("player-settings", {userCustom: custom, logo: imgData});
        }
    }catch(err){
        // console.error(err);
        next(err);
    }
}