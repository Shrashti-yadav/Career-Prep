import express from "express";
import {
  submitFeedback,
  getFeedbacks,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — home page reads this
router.get("/", getFeedbacks);

// Auth required
router.post("/",        protect, submitFeedback);
router.delete("/:id",   protect, deleteFeedback);

export default router;
