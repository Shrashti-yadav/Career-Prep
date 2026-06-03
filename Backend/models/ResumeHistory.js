import mongoose from "mongoose";

const resumeHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "",
    },

    atsScore: {
      type: Number,
      default: 0,
    },

    summary: {
      type: Object,
      default: {},
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    recruiterImpression: {
      type: String,
      default: "",
    },

    skillsData: {
      type: Array,
      default: [],
    },

    radarData: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ResumeHistory = mongoose.model(
  "ResumeHistory",
  resumeHistorySchema
);

export default ResumeHistory;