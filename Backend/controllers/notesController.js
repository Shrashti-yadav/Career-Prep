import asyncHandler from "express-async-handler";
import NotesHistory from "../models/NotesHistory.js";

// @desc Get all notes for logged-in user
// @route GET /api/history/notes
export const getNotesHistory = asyncHandler(async (req, res) => {
  const notes = await NotesHistory.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    data: notes,
  });
});

// @desc Save notes after generation
// @route POST /api/history/notes
export const saveNotes = asyncHandler(async (req, res) => {
  const { topic, summary, keyPoints, tips, quiz } = req.body;

  const note = await NotesHistory.create({
    user: req.user._id,
    topic,
    summary,
    keyPoints,
    tips,
    quizCount: quiz?.length || 0,
    quiz: quiz || [],
  });

  res.status(201).json({
    success: true,
    data: note,
  });
});

// @desc Delete note
// @route DELETE /api/history/notes/:id
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await NotesHistory.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (note.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  await note.deleteOne();

  res.json({
    success: true,
    message: "Note deleted",
  });
});