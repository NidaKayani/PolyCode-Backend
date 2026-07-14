const mongoose = require("mongoose");

const completedLessonSchema = new mongoose.Schema(
  {
    lessonId: { type: String, required: true },
    title: { type: String, default: "" },
    chapterId: { type: String, default: "" },
    chapterTitle: { type: String, default: "" },
    xp: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const savedCodeSchema = new mongoose.Schema(
  {
    lessonId: { type: String, required: true },
    code: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const lessonNoteSchema = new mongoose.Schema(
  {
    lessonId: { type: String, required: true },
    note: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    completedLessons: {
      type: [completedLessonSchema],
      default: [],
    },
    savedCode: {
      type: [savedCodeSchema],
      default: [],
    },
    notes: {
      type: [lessonNoteSchema],
      default: [],
    },
    bookmarks: {
      type: [String],
      default: [],
    },
    lastLessonId: {
      type: String,
      default: null,
    },
    totalXp: {
      type: Number,
      default: 0,
    },
    totalMinutesSpent: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
