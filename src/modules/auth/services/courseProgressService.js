const CourseProgress = require("../models/CourseProgress");
const OopsCppProgress = require("../models/OopsCppProgress");
const { assertCourseId } = require("../constants/courseIds");
const dailyXpService = require("./dailyXpService");

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

function countQuizAnswers(quizAttempts = {}) {
  return Object.keys(quizAttempts || {}).length;
}

function countQuizCorrect(quizAttempts = {}) {
  let correct = 0;
  for (const value of Object.values(quizAttempts || {})) {
    if (value && typeof value === "object" && value.correct === true) {
      correct += 1;
    }
  }
  return correct;
}

function normalizeQuizAttemptValue(value) {
  if (value == null) return null;
  if (typeof value === "number") {
    return {
      selectedIndex: value,
      correct: null,
      answeredAt: null,
    };
  }
  if (typeof value === "object") {
    const selectedIndex =
      value.selectedIndex !== undefined
        ? value.selectedIndex
        : value.selected !== undefined
          ? value.selected
          : null;
    return {
      selectedIndex,
      correct:
        value.correct === undefined || value.correct === null
          ? null
          : Boolean(value.correct),
      answeredAt: value.answeredAt || null,
    };
  }
  return null;
}

function mergeQuizAttempts(existing = {}, incoming = {}) {
  const next = { ...(existing || {}) };
  for (const [key, raw] of Object.entries(incoming || {})) {
    const normalized = normalizeQuizAttemptValue(raw);
    if (!normalized) continue;
    const prev = normalizeQuizAttemptValue(next[key]);
    next[key] = {
      selectedIndex:
        normalized.selectedIndex !== null && normalized.selectedIndex !== undefined
          ? normalized.selectedIndex
          : prev?.selectedIndex ?? null,
      correct:
        normalized.correct !== null && normalized.correct !== undefined
          ? normalized.correct
          : prev?.correct ?? null,
      answeredAt: normalized.answeredAt || prev?.answeredAt || new Date(),
    };
  }
  return next;
}

function upsertEngagementEntry(progress, payload = {}) {
  const lessonId = String(payload.lessonId || "").trim();
  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  if (!Array.isArray(progress.lessonEngagement)) {
    progress.lessonEngagement = [];
  }

  let entry = progress.lessonEngagement.find((item) => item.lessonId === lessonId);
  if (!entry) {
    entry = {
      lessonId,
      read: false,
      confidence: "",
      quizAttempts: {},
      challengeAttempts: 0,
      challengeLastResult: "",
      lastTab: "",
      updatedAt: new Date(),
    };
    progress.lessonEngagement.push(entry);
  }

  if (payload.read !== undefined) {
    entry.read = Boolean(payload.read) || entry.read;
  }
  if (payload.confidence !== undefined && payload.confidence !== null) {
    entry.confidence = String(payload.confidence);
  }
  if (payload.quizAttempts && typeof payload.quizAttempts === "object") {
    entry.quizAttempts = mergeQuizAttempts(
      entry.quizAttempts || {},
      payload.quizAttempts,
    );
  }
  if (payload.incrementChallengeAttempts) {
    entry.challengeAttempts = (Number(entry.challengeAttempts) || 0) + 1;
  } else if (payload.challengeAttempts !== undefined) {
    entry.challengeAttempts = Math.max(
      0,
      Number(payload.challengeAttempts) || 0,
    );
  }
  if (payload.challengeLastResult !== undefined && payload.challengeLastResult !== null) {
    entry.challengeLastResult = String(payload.challengeLastResult);
  }
  if (payload.lastTab !== undefined && payload.lastTab !== null) {
    entry.lastTab = String(payload.lastTab);
  }

  entry.updatedAt = new Date();
  return entry;
}

async function upsertLessonEngagement(userId, courseId, payload = {}) {
  const progress = await getOrCreateProgress(userId, courseId);
  upsertEngagementEntry(progress, payload);
  touchStreak(progress);
  await progress.save();
  return progress;
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
 *   lastLessonId?: string,
 *   engagementMap?: { [lessonId]: { read?, confidence?, quizAttempts? } }
 * }
 */
async function mergeLocalProgress(userId, courseId, localPayload = {}) {
  const progress = await getOrCreateProgress(userId, courseId);
  const completedMap = localPayload.completedMap || {};
  const savedCodeMap = localPayload.savedCodeMap || {};
  const notesMap = localPayload.notesMap || {};
  const engagementMap = localPayload.engagementMap || {};
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

  for (const [lessonId, engagement] of Object.entries(engagementMap)) {
    upsertEngagementEntry(progress, {
      lessonId,
      read: engagement?.read,
      confidence: engagement?.confidence,
      quizAttempts: engagement?.quizAttempts,
    });
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

function dayKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function isActiveStreakDate(lastActiveDate) {
  if (!lastActiveDate) return false;
  const last = dayKey(lastActiveDate);
  const today = dayKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);
  return last === today || last === yesterday;
}

function summarizeEngagement(docs = []) {
  let lessonsRead = 0;
  let quizAnswered = 0;
  let quizCorrect = 0;
  let challengeFails = 0;

  for (const doc of docs) {
    for (const row of doc.lessonEngagement || []) {
      if (row.read) lessonsRead += 1;
      quizAnswered += countQuizAnswers(row.quizAttempts);
      quizCorrect += countQuizCorrect(row.quizAttempts);
      challengeFails += Number(row.challengeAttempts) || 0;
    }
  }

  return { lessonsRead, quizAnswered, quizCorrect, challengeFails };
}

async function getLearnDashboard(userId) {
  const courses = await listProgressForUser(userId, { includePrivate: true });
  const dailyXp = await dailyXpService.getDailyXp(userId);

  let totalXp = 0;
  let totalMinutesSpent = 0;
  let bestStreak = 0;
  let activeStreak = 0;
  let coursesStarted = 0;

  const courseRows = courses.map((doc) => {
    const completedCount = (doc.completedLessons || []).length;
    const started =
      completedCount > 0 ||
      (doc.bookmarks || []).length > 0 ||
      Boolean(doc.lastLessonId) ||
      (doc.lessonEngagement || []).length > 0;
    if (started) coursesStarted += 1;

    totalXp += Number(doc.totalXp) || 0;
    totalMinutesSpent += Number(doc.totalMinutesSpent) || 0;
    bestStreak = Math.max(bestStreak, Number(doc.currentStreak) || 0);
    if (isActiveStreakDate(doc.lastActiveDate)) {
      activeStreak = Math.max(activeStreak, Number(doc.currentStreak) || 0);
    }

    return {
      courseId: doc.courseId,
      totalXp: doc.totalXp || 0,
      completedCount,
      bookmarks: (doc.bookmarks || []).length,
      minutes: doc.totalMinutesSpent || 0,
      streak: doc.currentStreak || 0,
      lastLessonId: doc.lastLessonId || null,
      lastActiveDate: doc.lastActiveDate || null,
      lessonsRead: (doc.lessonEngagement || []).filter((row) => row.read).length,
      quizAnswered: (doc.lessonEngagement || []).reduce(
        (sum, row) => sum + countQuizAnswers(row.quizAttempts),
        0,
      ),
      quizCorrect: (doc.lessonEngagement || []).reduce(
        (sum, row) => sum + countQuizCorrect(row.quizAttempts),
        0,
      ),
      challengeFails: (doc.lessonEngagement || []).reduce(
        (sum, row) => sum + (Number(row.challengeAttempts) || 0),
        0,
      ),
    };
  });

  courseRows.sort((a, b) => {
    const aTime = a.lastActiveDate ? new Date(a.lastActiveDate).getTime() : 0;
    const bTime = b.lastActiveDate ? new Date(b.lastActiveDate).getTime() : 0;
    return bTime - aTime;
  });

  const { lessonsRead, quizAnswered, quizCorrect, challengeFails } =
    summarizeEngagement(courses);
  const coursesCompleted = courseRows.filter((row) => row.completedCount > 0).length;
  const dailyXpTotal = dailyXp?.totalXp || 0;

  return {
    overview: {
      totalXp,
      dailyXpTotal,
      totalMinutesSpent,
      coursesStarted,
      coursesCompleted,
      bestStreak,
      activeStreak,
      lessonsRead,
      quizAnswered,
      quizCorrect,
      challengeFails,
    },
    courses: courseRows,
  };
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
  upsertLessonEngagement,
  mergeLocalProgress,
  mergeManyLocalProgress,
  getOrCreateProgress,
  getLearnDashboard,
};
