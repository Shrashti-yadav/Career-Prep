// controllers/revisionController.js
import axios from "axios";
import { RevisionNotes } from "../models/historyModels.js";

const PYTHON_URL = "http://localhost:8000";

export const generateRevisionNotes = async (req, res) => {
  try {
    const { topic, depth = "detailed" } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }

    // ── Forward to Python FastAPI ────────────────────────
    const pythonRes = await axios.post(`${PYTHON_URL}/revision/generate`, {
      topic,
      depth,
    });

    const { notes, quiz, raw_notes } = pythonRes.data;

    // ── Save to MongoDB ──────────────────────────────────
    if (req.user) {
      await RevisionNotes.create({
        user:      req.user._id,
        topic:     notes.topic   || topic,
        summary:   notes.summary || "",
        keyPoints: notes.keyPoints || [],
        tips:      notes.tips      || [],
        quizCount: quiz?.length    || 0,
      });
    }

    res.json({ success: true, notes, quiz, raw_notes });
  } catch (err) {
    console.error("generateRevisionNotes error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};