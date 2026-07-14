const {
  getOrCreateLearnerDoc,
  saveLearnerDoc,
} = require("./learnerProgressStore");

const READ_BONUS_XP = 3;

function toDateKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
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
  const learner = await getOrCreateLearnerDoc(userId);
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
  if (!learner.dailyXp) {
    learner.dailyXp = { days: [], totalXp: 0 };
  }
  if (!Array.isArray(learner.dailyXp.days)) {
    learner.dailyXp.days = [];
  }

  const dateKey = toDateKey();
  let day = learner.dailyXp.days.find((entry) => entry.dateKey === dateKey);

  if (!day) {
    learner.dailyXp.days.push({
      dateKey,
      lessons: [],
      lessonXp: 0,
      readBonusXp: 0,
      read: false,
      readAt: null,
    });
    day = learner.dailyXp.days[learner.dailyXp.days.length - 1];
  }

  if (day.lessons.some((lesson) => lesson.lessonId === lessonId)) {
    return formatResponse(learner.dailyXp);
  }

  day.lessons.push({
    lessonId,
    course,
    title,
    xp: xpAmount,
    recordedAt: new Date(),
  });
  day.lessonXp = (day.lessonXp || 0) + xpAmount;
  learner.dailyXp.totalXp = (learner.dailyXp.totalXp || 0) + xpAmount;
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
};
