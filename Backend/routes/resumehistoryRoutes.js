import express from "express";

import {
  saveResumeAnalysis,
  getResumeHistory,
  deleteResumeHistory,
} from "../controllers/resumeHistoryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// SAVE + GET
router
  .route("/")
  .post(protect, saveResumeAnalysis)
  .get(protect, getResumeHistory);


// DELETE
router
  .route("/:id")
  .delete(protect, deleteResumeHistory);

export default router;