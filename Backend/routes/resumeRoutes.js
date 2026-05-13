import express from "express";

import { analyzeResume } from "../controllers/analyzeController.js";

import { uploadResumeFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/resume/analyze",
  uploadResumeFiles,
  analyzeResume
);

export default router;