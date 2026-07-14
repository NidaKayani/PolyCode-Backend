const LearnerProgress = require("../models/LearnerProgress");
const { agentLog } = require("../../../debug/agentLog807e54");

/**
 * Get or create the single learner document for a user.
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
 * Retries once on VersionError (parallel profile fetches / writes).
 */
async function saveLearnerDoc(learner) {
  const size = Buffer.byteLength(JSON.stringify(learner.toObject()), "utf8");
  const max = LearnerProgress.MAX_DOC_BYTES || 10 * 1024 * 1024;
  if (size > max) {
    const error = new Error(
      `Learner progress document exceeds ${max} bytes (got ${size})`,
    );
    error.statusCode = 413;
    // #region agent log
    agentLog({
      location: "learnerProgressStore.js:saveLearnerDoc",
      message: "save rejected doc too large",
      data: { size, max, courseCount: learner.courses?.length },
      hypothesisId: "H3",
    });
    // #endregion
    throw error;
  }
  learner.markModified("courses");
  learner.markModified("dailyXp");
  learner.markModified("annotations");
  try {
    await learner.save();
  } catch (error) {
    if (error?.name === "VersionError") {
      // Another request saved first — reload and fail soft for reads;
      // writers should re-apply via higher-level retry if needed.
      error.statusCode = 409;
      error.message = "Progress was updated by another request; please retry";
    }
    throw error;
  }
  // #region agent log
  agentLog({
    location: "learnerProgressStore.js:saveLearnerDoc",
    message: "learner doc saved",
    data: {
      userId: String(learner.userId),
      courseCount: learner.courses?.length,
      courseIds: (learner.courses || []).map((c) => c.courseId),
      courseXp: (learner.courses || []).map((c) => ({
        courseId: c.courseId,
        totalXp: c.totalXp,
        completed: c.completedLessons?.length,
      })),
      docBytes: size,
    },
    hypothesisId: "H3",
  });
  // #endregion
  return learner;
}

module.exports = {
  getOrCreateLearnerDoc,
  courseToProgress,
  ensureCourseEntry,
  saveLearnerDoc,
};
