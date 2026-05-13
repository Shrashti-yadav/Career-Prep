import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({

  filename: String,

  filePath: String,

  content: String,

  analysis: Object,

  userId: String

},{timestamps:true});

export default mongoose.model("Resume",resumeSchema);