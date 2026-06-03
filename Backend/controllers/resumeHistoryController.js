import ResumeHistory from "../models/ResumeHistory.js";


// SAVE RESUME ANALYSIS
export const saveResumeAnalysis = async (req, res) => {
  try {
    const history = await ResumeHistory.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: history,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL RESUME HISTORY
export const getResumeHistory = async (req, res) => {
  try {

    const history = await ResumeHistory.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE RESUME HISTORY
export const deleteResumeHistory = async (req, res) => {
  try {

    const history = await ResumeHistory.findById(req.params.id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Resume history not found",
      });
    }

    // SECURITY CHECK
    if (history.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    await history.deleteOne();

    res.status(200).json({
      success: true,
      message: "Resume history deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};