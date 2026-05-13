import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

const extractText = async (file)=>{

  const buffer = fs.readFileSync(file.path);

  if(file.mimetype === "application/pdf"){

     const data = await pdf(buffer);
     return data.text;

  }

  if(file.mimetype.includes("word")){

     const result = await mammoth.extractRawText({buffer});
     return result.value;

  }

  if(file.mimetype === "text/plain"){

     return buffer.toString();

  }

};

export default extractText;