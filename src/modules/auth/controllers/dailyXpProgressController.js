/**
 * @deprecated Not mounted in auth.router.js. Use dailyXpController + DailyXpProgress.
 */
const dailyXpProgress = require("../services/dailyXpProgressService");

async function getDailyXp(req, res) {
  try {
    const data = await dailyXpProgress.getDailyXpProgress(req.userId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function recordDailyXp(req, res) {
  try {
    const { course, lessonId, title, xp } = req.body;
    if (!course || !lessonId) {
      return res
        .status(400)
        .json({ error: "course and lessonId are required" });
    }

    const data = await dailyXpProgress.recordXpEvent(req.userId, {
      course,
      lessonId,
      title,
      xp,
    });
    res.json({
      message: data.alreadyRecorded
        ? "Lesson XP already recorded"
        : `Recorded +${data.xpAwarded || 0} XP`,
      ...data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function markDailyXpRead(req, res) {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });
    }

    const data = await dailyXpProgress.markDayAsRead(req.userId, date);
    res.json({
      message: data.alreadyRead
        ? "Day already marked as read"
        : `Marked as read (+${data.bonusXp} XP)`,
      ...data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getDailyXp,
  recordDailyXp,
  markDailyXpRead,
};
