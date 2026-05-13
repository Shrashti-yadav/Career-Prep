import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const analyzeResume = async (req, res) => {
  try {

    console.log(req.files);
    console.log(req.body);

    if (!req.files?.resume) {
      return res.status(400).json({
        message: "Resume file required",
      });
    }

    const resumeFile = req.files.resume[0];
    const jdFile = req.files?.jd?.[0];

    const role =
      req.body.role || "MERN Stack Developer";

    const formData = new FormData();

    // resume
    formData.append(
      "resume",
      fs.createReadStream(resumeFile.path)
    );

    // optional jd
    if (jdFile) {
      formData.append(
        "jd",
        fs.createReadStream(jdFile.path)
      );
    }

    // role
    formData.append("role", role);

    const response = await axios.post(
      "http://127.0.0.1:8000/analyze-resume",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    fs.unlinkSync(resumeFile.path);

    if (jdFile) {
      fs.unlinkSync(jdFile.path);
    }

    return res.status(200).json(response.data);

  } catch (error) {

    console.log("FULL ERROR:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    return res.status(500).json({
      message: "Resume analysis failed",
      error: error.message,
    });
  }
};

export { analyzeResume };