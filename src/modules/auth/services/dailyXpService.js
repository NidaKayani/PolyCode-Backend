const DailyXpProgress = require("../models/DailyXpProgress");

const READ_BONUS_XP = 3;

function toDateKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

async function getOrCreate(userId) {
  let progress = await DailyXpProgress.findOne({ userId });
  if (!progress) {
    progress = await DailyXpProgress.create({ userId, days: [], totalXp: 0 });
  }
  return progress;
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

function formatResponse(progress) {
  const days = [...(progress.days || [])]
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .map(formatDay);

  return {
    days,
    totalXp: progress.totalXp || 0,
    unreadDays: days.filter((day) => !day.read).length,
    readBonusXp: READ_BONUS_XP,
  };
}

async function getDailyXp(userId) {
  const progress = await getOrCreate(userId);
  return formatResponse(progress);
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

  const progress = await getOrCreate(userId);
  const dateKey = toDateKey();
  let day = progress.days.find((entry) => entry.dateKey === dateKey);

  if (!day) {
    // push() casts the plain object into a subdocument copy, so grab the
    // casted subdoc back — mutating the original object would be lost on save.
    progress.days.push({
      dateKey,
      lessons: [],
      lessonXp: 0,
      readBonusXp: 0,
      read: false,
      readAt: null,
    });
    day = progress.days[progress.days.length - 1];
  }

  if (day.lessons.some((lesson) => lesson.lessonId === lessonId)) {
    return formatResponse(progress);
  }

  day.lessons.push({
    lessonId,
    course,
    title,
    xp: xpAmount,
    recordedAt: new Date(),
  });
  day.lessonXp = (day.lessonXp || 0) + xpAmount;
  progress.totalXp = (progress.totalXp || 0) + xpAmount;
  progress.markModified("days");
  await progress.save();

  return formatResponse(progress);
}

async function markDailyXpRead(userId, date) {
  if (!date) {
    throw new Error("date is required");
  }

  const progress = await getOrCreate(userId);
  const day = progress.days.find((entry) => entry.dateKey === date);

  if (!day) {
    throw new Error("No progress found for that date");
  }

  if (day.read) {
    return formatResponse(progress);
  }

  day.read = true;
  day.readBonusXp = READ_BONUS_XP;
  day.readAt = new Date();
  progress.totalXp = (progress.totalXp || 0) + READ_BONUS_XP;
  progress.markModified("days");
  await progress.save();

  return formatResponse(progress);
}

module.exports = {
  getDailyXp,
  recordDailyXp,
  markDailyXpRead,
};
