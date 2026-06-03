import mongoose from "mongoose";

const revisionNotesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      default: "",
    },

    keyPoints: {
      type: [
        {
          title: String,
          description: String,
          example: String,
        },
      ],
      default: [],
    },

    tips: {
      type: [String],
      default: [],
    },

    quizCount: {
      type: Number,
      default: 0,
    },

    quiz: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const NotesHistory = mongoose.model("NotesHistory", revisionNotesSchema);

export default NotesHistory;