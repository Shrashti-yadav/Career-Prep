// routes/revisionRoutes.js
import express from "express";
import { generateRevisionNotes } from "../controllers/revisionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/revision/generate
router.post("/generate", protect, generateRevisionNotes);

export default router;
