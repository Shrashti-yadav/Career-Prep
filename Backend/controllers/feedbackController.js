import Feedback from "../models/Feedback.js";

// ── POST /api/feedback ─────────────────────────────────────
// Auth required — logged in user submits feedback
export const submitFeedback = async (req, res) => {
  try {
    const { role, message, rating } = req.body;

    // Basic validation
    if (!message || !rating) {
      return res.status(400).json({
        success: false,
        message: "Message and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user already submitted feedback
    const existing = await Feedback.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback",
      });
    }

    const feedback = await Feedback.create({
      user:     req.user._id,
      userName: req.user.name,
      role:     role || "",
      message,
      rating,
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      data: feedback,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ── GET /api/feedback ──────────────────────────────────────
// Public — home page fetches all feedbacks
export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })   // newest first
      .limit(20);                // max 20 on home page

    res.status(200).json({
      success: true,
      data: feedbacks,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ── DELETE /api/feedback/:id ───────────────────────────────
// Auth required — user deletes their own feedback
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Security: only owner can delete
    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      message: "Feedback deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
