/**
 * @deprecated Unused alternate daily-XP model. Live routes use DailyXpProgress
 * via dailyXpService / dailyXpController. Do not mount this path.
 */
const mongoose = require("mongoose");

const xpEventSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    xp: { type: Number, default: 0 },
    course: { type: String, required: true },
    lessonId: { type: String, required: true },
    lessonTitle: { type: String, default: "" },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const dailyReadMarkSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    markedAt: { type: Date, default: Date.now },
    bonusXp: { type: Number, default: 3 },
  },
  { _id: false },
);

const userDailyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    xpEvents: {
      type: [xpEventSchema],
      default: [],
    },
    dailyReadMarks: {
      type: [dailyReadMarkSchema],
      default: [],
    },
    totalXp: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserDailyProgress", userDailyProgressSchema);
