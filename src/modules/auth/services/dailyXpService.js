const {
  findLearnerDoc,
  getOrCreateLearnerDoc,
  saveLearnerDoc,
} = require("./learnerProgressStore");

const READ_BONUS_XP = 3;

function toDateKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function ensureDailyXp(learner) {
  if (!learner.dailyXp) {
    learner.dailyXp = { days: [], totalXp: 0 };
  }
  if (!Array.isArray(learner.dailyXp.days)) {
    learner.dailyXp.days = [];
  }
  if (typeof learner.dailyXp.totalXp !== "number") {
    learner.dailyXp.totalXp = 0;
  }
  return learner.dailyXp;
}

function findLessonAcrossDays(dailyXp, lessonId, course = "") {
  for (const day of dailyXp.days || []) {
    const hit = (day.lessons || []).find((lesson) => {
      if (lesson.lessonId !== lessonId) return false;
      if (!course) return true;
      return !lesson.course || lesson.course === course;
    });
    if (hit) return hit;
  }
  return null;
}

/**
 * Mutate learner.dailyXp in-memory (no save). Returns true if a lesson was added.
 */
function applyLessonXp(learner, payload = {}) {
  const {
    course = "",
    lessonId,
    title = "",
    xp = 0,
    recordedAt = new Date(),
  } = payload;

  if (!lessonId) return false;

  const xpAmount = Math.max(0, Number(xp) || 0);
  if (xpAmount <= 0) return false;

  const dailyXp = ensureDailyXp(learner);

  if (findLessonAcrossDays(dailyXp, lessonId, course)) {
    return false;
  }

  const dateKey = toDateKey(recordedAt);
  let day = dailyXp.days.find((entry) => entry.dateKey === dateKey);

  if (!day) {
    dailyXp.days.push({
      dateKey,
      lessons: [],
      lessonXp: 0,
      readBonusXp: 0,
      read: false,
      readAt: null,
    });
    day = dailyXp.days[dailyXp.days.length - 1];
  }

  if ((day.lessons || []).some((lesson) => lesson.lessonId === lessonId)) {
    return false;
  }

  day.lessons.push({
    lessonId,
    course,
    title,
    xp: xpAmount,
    recordedAt: recordedAt instanceof Date ? recordedAt : new Date(recordedAt),
  });
  day.lessonXp = (day.lessonXp || 0) + xpAmount;
  dailyXp.totalXp = (dailyXp.totalXp || 0) + xpAmount;
  return true;
}

/**
 * Copy completed course lessons into dailyXp so the profile graph catches up.
 */
function backfillFromCourses(learner) {
  ensureDailyXp(learner);
  let changed = false;

  for (const course of learner.courses || []) {
    const courseId = course.courseId || "";
    for (const lesson of course.completedLessons || []) {
      const lessonId = lesson.lessonId;
      if (!lessonId) continue;
      const added = applyLessonXp(learner, {
        course: courseId,
        lessonId,
        title: lesson.title || "",
        xp: lesson.xp || 0,
        recordedAt: lesson.completedAt || new Date(),
      });
      if (added) changed = true;
    }
  }

  return changed;
}

function formatLesson(lesson) {
  const points = Number(lesson.xp) || 0;
  return {
    lessonId: lesson.lessonId,
    course: lesson.course || "",
    title: lesson.title || "",
    points,
    xp: points,
    recordedAt: lesson.recordedAt
      ? new Date(lesson.recordedAt).toISOString()
      : null,
  };
}

function formatDay(day) {
  const lessons = day.lessons || [];
  const courses = [...new Set(lessons.map((lesson) => lesson.course).filter(Boolean))];
  const lessonXp =
    day.lessonXp || lessons.reduce((sum, lesson) => sum + (Number(lesson.xp) || 0), 0);
  const readBonusXp = day.read ? day.readBonusXp || READ_BONUS_XP : 0;
  const pointsEarned = lessonXp + readBonusXp;

  return {
    date: day.dateKey,
    lessonsCompleted: lessons.length,
    courses,
    pointsEarned,
    xpEarned: pointsEarned,
    lessonPoints: lessonXp,
    lessonXp,
    readBonusPoints: readBonusXp,
    readBonusXp,
    read: Boolean(day.read),
    lessons: lessons.map(formatLesson),
  };
}

function formatResponse(dailyXp) {
  const days = [...(dailyXp?.days || [])]
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .map(formatDay);

  return {
    days,
    totalXp: dailyXp?.totalXp || 0,
    unreadDays: days.filter((day) => !day.read).length,
    readBonusXp: READ_BONUS_XP,
  };
}

async function getDailyXp(userId) {
  const learner = await findLearnerDoc(userId);
  if (!learner) {
    return formatResponse({ days: [], totalXp: 0 });
  }
  if (backfillFromCourses(learner)) {
    await saveLearnerDoc(learner);
  }
  return formatResponse(learner.dailyXp);
}

async function recordDailyXp(userId, payload = {}) {
  const { course = "", lessonId, title = "", xp = 0 } = payload;

  if (!lessonId) {
    throw new Error("lessonId is required");
  }

  const xpAmount = Math.max(0, Number(xp) || 0);
  if (xpAmount <= 0) {
    return getDailyXp(userId);
  }

  const learner = await getOrCreateLearnerDoc(userId);
  applyLessonXp(learner, {
    course,
    lessonId,
    title,
    xp: xpAmount,
    recordedAt: new Date(),
  });
  await saveLearnerDoc(learner);

  return formatResponse(learner.dailyXp);
}

async function markDailyXpRead(userId, date) {
  if (!date) {
    throw new Error("date is required");
  }

  const learner = await getOrCreateLearnerDoc(userId);
  if (!learner.dailyXp?.days) {
    throw new Error("No progress found for that date");
  }

  const day = learner.dailyXp.days.find((entry) => entry.dateKey === date);

  if (!day) {
    throw new Error("No progress found for that date");
  }

  if (day.read) {
    return formatResponse(learner.dailyXp);
  }

  day.read = true;
  day.readBonusXp = READ_BONUS_XP;
  day.readAt = new Date();
  learner.dailyXp.totalXp = (learner.dailyXp.totalXp || 0) + READ_BONUS_XP;
  await saveLearnerDoc(learner);

  return formatResponse(learner.dailyXp);
}

module.exports = {
  getDailyXp,
  recordDailyXp,
  markDailyXpRead,
  applyLessonXp,
  backfillFromCourses,
};
