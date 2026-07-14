/**
 * @deprecated Not mounted in auth.router.js. Use dailyXpService + DailyXpProgress.
 */
const UserDailyProgress = require("../models/UserDailyProgress");
const OopsCppProgress = require("../models/OopsCppProgress");

const READ_BONUS_XP = 3;

async function getOrCreateDailyProgress(userId) {
  let progress = await UserDailyProgress.findOne({ userId });

  if (!progress) {
    progress = new UserDailyProgress({ userId });
    await progress.save();
  }

  return progress;
}

function toDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function eventKey(course, lessonId) {
  return `${course}::${lessonId}`;
}

function collectEvents(progress, oopsProgress) {
  const events = [...(progress?.xpEvents || [])];
  const seen = new Set(events.map((e) => eventKey(e.course, e.lessonId)));

  for (const lesson of oopsProgress?.completedLessons || []) {
    const course = "oops-cpp";
    const lessonId = lesson.lessonId;
    const key = eventKey(course, lessonId);
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      date: toDateKey(lesson.completedAt),
      xp: lesson.xp || 0,
      course,
      lessonId,
      lessonTitle: lesson.title || "",
      earnedAt: lesson.completedAt || new Date(),
    });
  }

  return events.filter((event) => event.date && event.lessonId);
}

function buildDailyMap(progress, oopsProgress) {
  const byDate = new Map();
  const events = collectEvents(progress, oopsProgress);

  const ensureDay = (date) => {
    if (!byDate.has(date)) {
      byDate.set(date, {
        date,
        lessonXp: 0,
        lessonsCompleted: 0,
        courses: new Set(),
        read: false,
        readBonusXp: 0,
        lessons: [],
      });
    }
    return byDate.get(date);
  };

  for (const event of events) {
    const day = ensureDay(event.date);
    day.lessonXp += event.xp || 0;
    day.lessonsCompleted += 1;
    day.courses.add(event.course);
    day.lessons.push({
      course: event.course,
      lessonId: event.lessonId,
      title: event.lessonTitle,
      xp: event.xp || 0,
    });
  }

  for (const mark of progress?.dailyReadMarks || []) {
    if (!mark?.date) continue;
    const day = ensureDay(mark.date);
    day.read = true;
    day.readBonusXp = mark.bonusXp || READ_BONUS_XP;
  }

  for (const mark of oopsProgress?.dailyReadMarks || []) {
    if (!mark?.date) continue;
    const day = ensureDay(mark.date);
    if (!day.read) {
      day.read = true;
      day.readBonusXp = mark.bonusXp || READ_BONUS_XP;
    }
  }

  return byDate;
}

function serializeDailyProgress(progress, oopsProgress) {
  const byDate = buildDailyMap(progress, oopsProgress);
  const days = Array.from(byDate.values())
    .map((day) => ({
      date: day.date,
      lessonXp: day.lessonXp,
      lessonsCompleted: day.lessonsCompleted,
      courses: Array.from(day.courses),
      lessons: day.lessons,
      read: day.read,
      readBonusXp: day.read ? day.readBonusXp : 0,
      xpEarned: day.lessonXp + (day.read ? day.readBonusXp : 0),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const lessonXpTotal = days.reduce((sum, day) => sum + day.lessonXp, 0);
  const readBonusTotal = days.reduce((sum, day) => sum + day.readBonusXp, 0);
  const unreadDays = days.filter((day) => !day.read && day.lessonXp > 0).length;
  const totalXp = days.reduce((sum, day) => sum + day.xpEarned, 0);

  return {
    days,
    totalXp,
    lessonXpTotal,
    readBonusTotal,
    unreadDays,
    currentStreak: oopsProgress?.currentStreak || 0,
    readBonusXp: READ_BONUS_XP,
  };
}

async function loadProgressPair(userId) {
  const [progress, oopsProgress] = await Promise.all([
    getOrCreateDailyProgress(userId),
    OopsCppProgress.findOne({ userId }),
  ]);
  return { progress, oopsProgress };
}

async function getDailyXpProgress(userId) {
  const { progress, oopsProgress } = await loadProgressPair(userId);
  return serializeDailyProgress(progress, oopsProgress);
}

async function recordXpEvent(userId, payload = {}) {
  const { course, lessonId, title, xp = 0 } = payload;
  if (!course || !lessonId) {
    throw new Error("course and lessonId are required");
  }

  const progress = await getOrCreateDailyProgress(userId);
  const exists = progress.xpEvents.some(
    (event) => event.course === course && event.lessonId === lessonId,
  );

  if (exists) {
    const { oopsProgress } = await loadProgressPair(userId);
    return {
      alreadyRecorded: true,
      ...serializeDailyProgress(progress, oopsProgress),
    };
  }

  const earnedAt = new Date();
  const date = toDateKey(earnedAt);
  const xpAmount = Number(xp) || 0;

  progress.xpEvents.push({
    date,
    xp: xpAmount,
    course,
    lessonId,
    lessonTitle: title || "",
    earnedAt,
  });
  progress.totalXp += xpAmount;
  await progress.save();

  const { oopsProgress } = await loadProgressPair(userId);
  return {
    alreadyRecorded: false,
    xpAwarded: xpAmount,
    ...serializeDailyProgress(progress, oopsProgress),
  };
}

async function markDayAsRead(userId, date) {
  const dateKey = toDateKey(date);
  if (!dateKey) {
    throw new Error("A valid date is required (YYYY-MM-DD)");
  }

  const progress = await getOrCreateDailyProgress(userId);
  const existing = (progress.dailyReadMarks || []).find(
    (mark) => mark.date === dateKey,
  );

  const { oopsProgress } = await loadProgressPair(userId);

  if (existing) {
    return {
      alreadyRead: true,
      bonusXp: 0,
      ...serializeDailyProgress(progress, oopsProgress),
    };
  }

  progress.dailyReadMarks.push({
    date: dateKey,
    markedAt: new Date(),
    bonusXp: READ_BONUS_XP,
  });
  progress.totalXp += READ_BONUS_XP;
  await progress.save();

  return {
    alreadyRead: false,
    bonusXp: READ_BONUS_XP,
    ...serializeDailyProgress(progress, oopsProgress),
  };
}

module.exports = {
  getDailyXpProgress,
  recordXpEvent,
  markDayAsRead,
  READ_BONUS_XP,
};
