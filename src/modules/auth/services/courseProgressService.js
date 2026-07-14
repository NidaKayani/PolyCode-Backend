const CourseProgress = require("../models/CourseProgress");
const OopsCppProgress = require("../models/OopsCppProgress");
const { assertCourseId } = require("../constants/courseIds");

function touchStreak(progress) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!progress.lastActiveDate) {
    progress.currentStreak = 1;
  } else {
    const last = new Date(progress.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) progress.currentStreak += 1;
    else if (diffDays > 1) progress.currentStreak = 1;
  }

  progress.lastActiveDate = new Date();
}

function recalcTotalXp(progress) {
  progress.totalXp = (progress.completedLessons || []).reduce(
    (sum, lesson) => sum + (Number(lesson.xp) || 0),
    0,
  );
}

async function migrateOopsCppIfNeeded(userId, progress) {
  if (progress.courseId !== "oops-cpp") return progress;
  if ((progress.completedLessons || []).length > 0) return progress;

  const legacy = await OopsCppProgress.findOne({ userId }).lean();
  if (!legacy) return progress;

  progress.completedLessons = legacy.completedLessons || [];
  progress.savedCode = legacy.savedCode || [];
  progress.notes = legacy.notes || [];
  progress.bookmarks = legacy.bookmarks || [];
  progress.lastLessonId = legacy.lastLessonId || null;
  progress.totalXp = legacy.totalXp || 0;
  progress.totalMinutesSpent = legacy.totalMinutesSpent || 0;
  progress.currentStreak = legacy.currentStreak || 0;
  progress.lastActiveDate = legacy.lastActiveDate || null;
  await progress.save();
  return progress;
}

async function getOrCreateProgress(userId, courseId) {
  const id = assertCourseId(courseId);
  let progress = await CourseProgress.findOne({ userId, courseId: id });

  if (!progress) {
    progress = new CourseProgress({ userId, courseId: id });
    await progress.save();
  }

  return migrateOopsCppIfNeeded(userId, progress);
}

async function getProgress(userId, courseId) {
  return getOrCreateProgress(userId, courseId);
}

async function listProgressForUser(userId, { includePrivate = true } = {}) {
  const docs = await CourseProgress.find({ userId }).lean();

  // Ensure OOP legacy shows up even before first CourseProgress touch
  const hasOops = docs.some((d) => d.courseId === "oops-cpp");
  if (!hasOops) {
    const legacy = await OopsCppProgress.findOne({ userId }).lean();
    if (legacy) {
      docs.push({
        userId,
        courseId: "oops-cpp",
        completedLessons: legacy.completedLessons || [],
        savedCode: includePrivate ? legacy.savedCode || [] : [],
        notes: includePrivate ? legacy.notes || [] : [],
        bookmarks: legacy.bookmarks || [],
        lastLessonId: legacy.lastLessonId || null,
        totalXp: legacy.totalXp || 0,
        totalMinutesSpent: legacy.totalMinutesSpent || 0,
        currentStreak: legacy.currentStreak || 0,
        lastActiveDate: legacy.lastActiveDate || null,
      });
    }
  }

  if (!includePrivate) {
    return docs.map((doc) => ({
      courseId: doc.courseId,
      completedLessons: (doc.completedLessons || []).map((lesson) => ({
        lessonId: lesson.lessonId,
        title: lesson.title,
        chapterId: lesson.chapterId,
        chapterTitle: lesson.chapterTitle,
        xp: lesson.xp,
        completedAt: lesson.completedAt,
      })),
      bookmarks: doc.bookmarks || [],
      lastLessonId: doc.lastLessonId || null,
      totalXp: doc.totalXp || 0,
      totalMinutesSpent: doc.totalMinutesSpent || 0,
      currentStreak: doc.currentStreak || 0,
      lastActiveDate: doc.lastActiveDate || null,
    }));
  }

  return docs;
}

async function completeLesson(userId, courseId, lesson) {
  const progress = await getOrCreateProgress(userId, courseId);
  const lessonId = lesson.lessonId || lesson.id;
  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  const existing = progress.completedLessons.find(
    (item) => item.lessonId === lessonId,
  );

  if (!existing) {
    progress.completedLessons.push({
      lessonId,
      title: lesson.title || "",
      chapterId: lesson.chapterId || "",
      chapterTitle: lesson.chapterTitle || "",
      xp: lesson.xp || 0,
      completedAt: new Date(),
    });
    recalcTotalXp(progress);
  }

  progress.lastLessonId = lessonId;
  touchStreak(progress);
  await progress.save();
  return progress;
}

async function setLastLesson(userId, courseId, lessonId) {
  const progress = await getOrCreateProgress(userId, courseId);
  progress.lastLessonId = lessonId;
  touchStreak(progress);
  await progress.save();
  return progress;
}

async function saveCode(userId, courseId, lessonId, code) {
  const progress = await getOrCreateProgress(userId, courseId);
  const existing = progress.savedCode.find((item) => item.lessonId === lessonId);

  if (existing) {
    existing.code = code;
    existing.updatedAt = new Date();
  } else {
    progress.savedCode.push({ lessonId, code, updatedAt: new Date() });
  }

  progress.lastLessonId = lessonId;
  touchStreak(progress);
  await progress.save();
  return progress;
}

async function saveNote(userId, courseId, lessonId, note) {
  const progress = await getOrCreateProgress(userId, courseId);
  const existing = progress.notes.find((item) => item.lessonId === lessonId);

  if (existing) {
    existing.note = note;
    existing.updatedAt = new Date();
  } else {
    progress.notes.push({ lessonId, note, updatedAt: new Date() });
  }

  progress.lastLessonId = lessonId;
  touchStreak(progress);
  await progress.save();
  return progress;
}

async function toggleBookmark(userId, courseId, lessonId) {
  const progress = await getOrCreateProgress(userId, courseId);

  if (progress.bookmarks.includes(lessonId)) {
    progress.bookmarks = progress.bookmarks.filter((id) => id !== lessonId);
  } else {
    progress.bookmarks.push(lessonId);
  }

  progress.lastLessonId = lessonId;
  touchStreak(progress);
  await progress.save();
  return progress;
}

async function addTime(userId, courseId, minutes) {
  const progress = await getOrCreateProgress(userId, courseId);
  progress.totalMinutesSpent += Math.max(0, Number(minutes) || 0);
  touchStreak(progress);
  await progress.save();
  return progress;
}

/**
 * Merge browser-local progress into Mongo (login migration).
 * localPayload shape:
 * {
 *   completedMap?: { [lessonId]: { xp, at, title?, chapterId?, chapterTitle? } },
 *   savedCodeMap?: { [lessonId]: string },
 *   notesMap?: { [lessonId]: string },
 *   bookmarks?: string[],
 *   lastLessonId?: string
 * }
 */
async function mergeLocalProgress(userId, courseId, localPayload = {}) {
  const progress = await getOrCreateProgress(userId, courseId);
  const completedMap = localPayload.completedMap || {};
  const savedCodeMap = localPayload.savedCodeMap || {};
  const notesMap = localPayload.notesMap || {};
  const bookmarks = Array.isArray(localPayload.bookmarks)
    ? localPayload.bookmarks
    : [];

  for (const [lessonId, meta] of Object.entries(completedMap)) {
    const existing = progress.completedLessons.find(
      (item) => item.lessonId === lessonId,
    );
    const localAt = meta?.at ? new Date(meta.at) : null;
    if (!existing) {
      progress.completedLessons.push({
        lessonId,
        title: meta?.title || "",
        chapterId: meta?.chapterId || "",
        chapterTitle: meta?.chapterTitle || "",
        xp: Number(meta?.xp) || 0,
        completedAt: localAt && !Number.isNaN(localAt.getTime()) ? localAt : new Date(),
      });
    } else if (
      localAt &&
      !Number.isNaN(localAt.getTime()) &&
      existing.completedAt &&
      localAt > new Date(existing.completedAt)
    ) {
      existing.xp = Number(meta?.xp) || existing.xp || 0;
      if (meta?.title) existing.title = meta.title;
      existing.completedAt = localAt;
    }
  }

  for (const [lessonId, code] of Object.entries(savedCodeMap)) {
    const existing = progress.savedCode.find((item) => item.lessonId === lessonId);
    if (existing) {
      if (!existing.code && code) {
        existing.code = code;
        existing.updatedAt = new Date();
      }
    } else if (typeof code === "string") {
      progress.savedCode.push({ lessonId, code, updatedAt: new Date() });
    }
  }

  for (const [lessonId, note] of Object.entries(notesMap)) {
    const existing = progress.notes.find((item) => item.lessonId === lessonId);
    if (existing) {
      if (!existing.note && note) {
        existing.note = note;
        existing.updatedAt = new Date();
      }
    } else if (typeof note === "string") {
      progress.notes.push({ lessonId, note, updatedAt: new Date() });
    }
  }

  const bookmarkSet = new Set([...(progress.bookmarks || []), ...bookmarks]);
  progress.bookmarks = Array.from(bookmarkSet);

  if (localPayload.lastLessonId && !progress.lastLessonId) {
    progress.lastLessonId = localPayload.lastLessonId;
  }

  recalcTotalXp(progress);
  touchStreak(progress);
  await progress.save();
  return progress;
}

async function mergeManyLocalProgress(userId, courses = {}) {
  const results = {};
  for (const [courseId, payload] of Object.entries(courses)) {
    try {
      results[courseId] = await mergeLocalProgress(userId, courseId, payload);
    } catch (error) {
      results[courseId] = { error: error.message };
    }
  }
  return results;
}

module.exports = {
  getProgress,
  listProgressForUser,
  completeLesson,
  setLastLesson,
  saveCode,
  saveNote,
  toggleBookmark,
  addTime,
  mergeLocalProgress,
  mergeManyLocalProgress,
  getOrCreateProgress,
};
