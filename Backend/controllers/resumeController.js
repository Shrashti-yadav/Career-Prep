import Resume from "../models/Resume.js";
import extractText from "../utils/extractText.js";
import analyzeResume from "../services/aiService.js";

export const uploadResume = async (req,res)=>{

  try{

    const file = req.file;

    const text = await extractText(file);

    const analysis = await analyzeResume(text);

    const resume = await Resume.create({

      filename:file.originalname,
      filePath:file.path,
      content:text,
      analysis:analysis,
      userId:req.body.userId

    });

    res.json({

      resumeId:resume._id,
      analysis

    });

  }catch(err){

    console.log(err);
    res.status(500).json({message:"Upload failed"});

  }

};