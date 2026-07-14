const LearnerProgress = require("../models/LearnerProgress");

/**
 * Find learner doc without creating. Returns null if missing.
 */
async function findLearnerDoc(userId) {
  return LearnerProgress.findOne({ userId });
}

/**
 * Get or create the single learner document for a user.
 * Prefer writes only — reads should use findLearnerDoc.
 */
async function getOrCreateLearnerDoc(userId) {
  let doc = await LearnerProgress.findOne({ userId });
  if (!doc) {
    doc = new LearnerProgress({
      userId,
      courses: [],
      dailyXp: { days: [], totalXp: 0 },
      annotations: [],
    });
    await doc.save();
  }
  if (!doc.dailyXp) {
    doc.dailyXp = { days: [], totalXp: 0 };
  }
  if (!Array.isArray(doc.courses)) doc.courses = [];
  if (!Array.isArray(doc.annotations)) doc.annotations = [];
  return doc;
}

/**
 * Serialize a course subdoc into the API shape formerly returned by CourseProgress.
 */
function courseToProgress(course, userId) {
  if (!course) return null;
  const plain = typeof course.toObject === "function" ? course.toObject() : course;
  return {
    userId,
    courseId: plain.courseId,
    completedLessons: plain.completedLessons || [],
    savedCode: plain.savedCode || [],
    notes: plain.notes || [],
    lessonEngagement: plain.lessonEngagement || [],
    bookmarks: plain.bookmarks || [],
    lastLessonId: plain.lastLessonId || null,
    totalXp: plain.totalXp || 0,
    totalMinutesSpent: plain.totalMinutesSpent || 0,
    currentStreak: plain.currentStreak || 0,
    lastActiveDate: plain.lastActiveDate || null,
  };
}

/**
 * Find or create a course entry inside the learner doc. Does not save.
 */
function ensureCourseEntry(learner, courseId) {
  let course = learner.courses.find((item) => item.courseId === courseId);
  if (!course) {
    learner.courses.push({
      courseId,
      completedLessons: [],
      savedCode: [],
      notes: [],
      lessonEngagement: [],
      bookmarks: [],
      lastLessonId: null,
      totalXp: 0,
      totalMinutesSpent: 0,
      currentStreak: 0,
      lastActiveDate: null,
    });
    course = learner.courses[learner.courses.length - 1];
  }
  return course;
}

/**
 * Persist learner doc with size guard against Mongo's 16MB limit.
 */
async function saveLearnerDoc(learner) {
  const size = Buffer.byteLength(JSON.stringify(learner.toObject()), "utf8");
  const max = LearnerProgress.MAX_DOC_BYTES || 10 * 1024 * 1024;
  if (size > max) {
    const error = new Error(
      `Learner progress document exceeds ${max} bytes (got ${size})`,
    );
    error.statusCode = 413;
    throw error;
  }
  learner.markModified("courses");
  learner.markModified("dailyXp");
  learner.markModified("annotations");
  try {
    await learner.save();
  } catch (error) {
    if (error?.name === "VersionError") {
      error.statusCode = 409;
      error.message = "Progress was updated by another request; please retry";
    }
    throw error;
  }
  return learner;
}

module.exports = {
  findLearnerDoc,
  getOrCreateLearnerDoc,
  courseToProgress,
  ensureCourseEntry,
  saveLearnerDoc,
};
