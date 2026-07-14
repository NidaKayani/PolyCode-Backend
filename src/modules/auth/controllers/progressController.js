const progressService = require("../services/progressService");
const polycoderProgressService = require("../services/polycoderProgressService");
const User = require("../models/User");

function sendPolycoderProgress(res, progress) {
  res.set("Content-Type", "application/json; charset=utf-8");
  res.send(`${JSON.stringify(progress, null, 2)}\n`);
}

/**
 * GET /api/auth/polycoder/:username/progress - Full progress JSON for a polycoder
 */
async function getPolycoderProgress(req, res) {
  try {
    const { username } = req.params;
    const progress = await polycoderProgressService.getProgressByUsername(username);
    sendPolycoderProgress(res, progress);
  } catch (error) {
    console.error("Get polycoder progress error:", error.message);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
}

/**
 * GET /api/auth/polycoder/me/progress - Progress for the authenticated polycoder
 */
async function getMyPolycoderProgress(req, res) {
  try {
    const user = await User.findById(req.userId).select("username");
    const username = user?.username;

    if (!username) {
      return res.status(404).json({
        error: "No polycoder username on this account",
      });
    }

    const progress = await polycoderProgressService.getProgressByUsername(username);
    sendPolycoderProgress(res, progress);
  } catch (error) {
    console.error("Get my polycoder progress error:", error.message);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
}

/**
 * GET /api/auth/polycoder/:username/daily-points - Daily points earned per day
 */
async function getPolycoderDailyPoints(req, res) {
  try {
    const { username } = req.params;
    const data = await polycoderProgressService.getDailyPointsByUsername(username);
    sendPolycoderProgress(res, data);
  } catch (error) {
    console.error("Get polycoder daily points error:", error.message);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
}

/**
 * GET /api/auth/polycoder/me/daily-points - Daily points for the authenticated polycoder
 */
async function getMyPolycoderDailyPoints(req, res) {
  try {
    const user = await User.findById(req.userId).select("username");
    const username = user?.username;

    if (!username) {
      return res.status(404).json({
        error: "No polycoder username on this account",
      });
    }

    const data = await polycoderProgressService.getDailyPointsByUsername(username);
    sendPolycoderProgress(res, data);
  } catch (error) {
    console.error("Get my polycoder daily points error:", error.message);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
}

/**
 * GET /api/progress/dashboard/:userId - Get dashboard stats
 */
async function getDashboardStats(req, res) {
  try {
    const { userId } = req.params;
    const stats = await progressService.getUserDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getDashboardStats,
  getPolycoderProgress,
  getMyPolycoderProgress,
  getPolycoderDailyPoints,
  getMyPolycoderDailyPoints,
};
