import AWS from "aws-sdk";
import multer from "multer";
import dotenv from "dotenv";
import vttConvert from "aws-transcription-to-vtt";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

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

export const s3 = new AWS.S3({
  useDualstackEndpoint: true,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }});

export const transcribeService = new AWS.TranscribeService();

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export async function uploadFile(bucketName, fileName, fileContent, contentType, callback) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileContent,
    Key: fileName,
    ContentType: contentType,
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error("Error uploading file to S3:", err);
      callback(err, null);
    } else {
      console.log("File uploaded successfully to S3");
      callback(null, data.Location);
    }
  });
};


export const uploadVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = uuidv4();

    const videobucketName = process.env.VIDEO_BUCKET;
    const videoName = (req.files.videoFile[0].originalname).replace(/ /g, "");
    console.log(videoName)
    const videoObjectKey = `${userId}-${fileId}-${videoName}`; 
    const videodata = req.files.videoFile[0].buffer;

    await new Promise((resolve, reject) => {
      uploadFile(videobucketName, videoObjectKey, videodata, "video/mp4", (err, videoUrl) => {
        if (err) {
          reject(err);
        } else {
          console.log("Video uploaded successfully");
          resolve(videoUrl);
        }
      });
    });


    
    const imagebucketname = process.env.IMAGE_BUCKET;
    const imageName = (req.files.imageFile[0].originalname).replace(/ /g, "");
    const imageObjectKey = `${userId}-${fileId}-${imageName}`; 
    const imagedata = req.files.imageFile[0].buffer ;

    await new Promise((resolve, reject) => {
      uploadFile(imagebucketname, imageObjectKey, imagedata, "image/png",(err, imageUrl) => {
        if (err) {
          reject(err);
        } else {
          console.log("Image uploaded successfully");
          resolve(imageUrl);
        }
      });
    });

    const vttObjectKey = `${userId}-${fileId}-${videoName}.vtt`
    await new Promise ((resolve,reject) => {
      transcribeVideo(videobucketName, videoObjectKey)
              .then((jsonData) => {
                const vtt = vttConvert(jsonData);
                console.log(vtt);
                const vtt_bucket = process.env.VTT_BUCKET;
                uploadFile(vtt_bucket, vttObjectKey ,vtt, "text/vtt", async (vttErr, vttUrl) => {
                    if (vttErr) {
                      console.error("Error uploading VTT file:", vttErr);
                      reject(vttErr)
                    } else {
                      console.log("VTT file uploaded successfully");
                      await deleteS3Object(vtt_bucket, `${videoObjectKey}.json`);
                      resolve(vttUrl);
                    }});
                  })
                });  
    console.log(videoObjectKey)
    console.log(imageObjectKey)
    console.log(vttObjectKey)
    
    return { videoObjectKey, imageObjectKey, vttObjectKey };
  } catch (err) {
    console.error("Error uploading files:", err);
    res.status(500).json({ success: false, message: "Failed to upload files." });
  }
};


export function transcribeVideo(bucketName, objectKey) {
  try{
    return new Promise((resolve, reject) => {
      const jobName = `${objectKey}`;
      const params = {
        TranscriptionJobName: jobName,
        LanguageCode: "en-US",
        Media: {
          MediaFileUri: `s3://${bucketName}/${objectKey}`,
        },
        OutputBucketName: "streambox-vtts", 
      };

      transcribeService.startTranscriptionJob(params, (err, data) => {
        if (err) {
          console.error("Error starting transcription job:", err);
          reject(err); 
        } else {
          console.log("Transcription job started successfully:", data);
          waitForTranscriptionJobCompletion(jobName, (err, jsonData) => {
            if (err) {
              console.error("Error:", err);
              reject(err); 
            } else {
              console.log("JSON data:", jsonData);
              resolve(jsonData); 
            }
          });
        }
      });
    });
  }catch(err){
    console.error("Error in transcribing video:", err);
    res.status(500).json({ success: false, message: "Failed to transcribe video." });
  }
}

export function waitForTranscriptionJobCompletion(jobName, callback) {
  try{
    const params = {
      TranscriptionJobName: jobName,
    };

    function pollStatus() {
      transcribeService.getTranscriptionJob(params, (err, data) => {
        if (err) {
          console.error("Error getting transcription job status:", err);
          callback(err);
        } else {
          const { TranscriptionJob } = data;
          const status = TranscriptionJob.TranscriptionJobStatus;
          console.log("Transcription job status:", status);

          if (status === "COMPLETED") {
            const transcriptFileUri =
              TranscriptionJob.Transcript.TranscriptFileUri;
            const parts = transcriptFileUri.split("/");
            const bucketName = parts[3];
            const objectKey = parts.slice(4).join("/");

            downloadJsonFile(bucketName, objectKey, callback);
          } else if (status === "FAILED" || status === "CANCELLED") {
            console.error("Transcription job failed or was cancelled.");
            callback(new Error("Transcription job failed or was cancelled."));
          } else {
            setTimeout(pollStatus, 5000); 
          }
        }
      });
    }
    pollStatus();
  }catch(err){
    console.log("Error in waiting for transcription job to complete", err);
    throw err;
  }
}

export function downloadJsonFile(bucketName, objectKey, callback) {
  const params = {
    Bucket: bucketName,
    Key: objectKey, 
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      console.error("Error downloading JSON file from S3:", err);
      callback(err);
    } else {
      // Data is a buffer containing the contents of the JSON file
      callback(null, JSON.parse(data.Body.toString("utf-8")));
    }
  });
}

export async function deleteS3Object(bucketName, objectKey){
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };
    try{
      const data = await s3.deleteObject(params).promise()
      console.log("Object deleted successfully:", data);
    }catch(err){
        // console.error(err);
    }
}


