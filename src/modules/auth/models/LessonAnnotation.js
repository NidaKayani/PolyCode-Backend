const mongoose = require("mongoose");

const strokeSchema = new mongoose.Schema(
  {
    color: { type: String, default: "" },
    width: { type: Number, default: 3 },
    points: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { _id: false },
);

const labelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    text: { type: String, default: "" },
  },
  { _id: false },
);

const lessonAnnotationSchema = new mongoose.Schema(
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
    lessonId: {
      type: String,
      required: true,
      index: true,
    },
    tab: {
      type: String,
      default: "theory",
      enum: ["theory", "challenge"],
    },
    strokes: {
      type: [strokeSchema],
      default: [],
    },
    labels: {
      type: [labelSchema],
      default: [],
    },
  },
  { timestamps: true },
);

lessonAnnotationSchema.index(
  { userId: 1, courseId: 1, lessonId: 1, tab: 1 },
  { unique: true },
);

module.exports = mongoose.model("LessonAnnotation", lessonAnnotationSchema);
