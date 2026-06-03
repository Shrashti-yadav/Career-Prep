import express from "express";
import {
  getNotesHistory,
  saveNotes,
  deleteNote,
} from "../controllers/notesController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getNotesHistory)
  .post(protect, saveNotes);

router.route("/:id").delete(protect, deleteNote);

export default router;