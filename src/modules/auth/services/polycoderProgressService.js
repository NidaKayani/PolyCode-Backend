const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const OopsCppProgress = require("../models/OopsCppProgress");
const CourseProgress = require("../models/CourseProgress");
const dailyXpService = require("./dailyXpService");

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function isValidUsername(username) {
  return /^[a-z0-9_][a-z0-9_.-]{2,29}$/.test(username);
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function serializeLanguageTrack(entry) {
  if (!entry) return null;

  return {
    language: entry.language,
    status: entry.status || "not-started",
    progressPercent: entry.progressPercentage ?? 0,
    minutesSpent: entry.totalMinutesSpent ?? 0,
    currentStreak: entry.currentStreak ?? 0,
    highestStreak: entry.highestStreak ?? 0,
    lastAccessedModule: entry.lastAccessedModule ?? null,
    completedModules: entry.completedModules ?? [],
    completedDocuments: (entry.completedDocuments ?? []).map((doc) => ({
      path: doc.path,
      title: doc.title,
      completedAt: formatDate(doc.completedAt),
    })),
    bookmarksCount: entry.bookmarkedDocuments?.length ?? 0,
  };
}

function serializeOopsCpp(course) {
  if (!course) return null;

  return {
    courseName: "Object-Oriented C++",
    courseId: "oops-cpp",
    lastLessonId: course.lastLessonId ?? null,
    stats: {
      totalXp: course.totalXp ?? 0,
      minutesSpent: course.totalMinutesSpent ?? 0,
      currentStreak: course.currentStreak ?? 0,
      lastActive: formatDate(course.lastActiveDate),
      bookmarksCount: course.bookmarks?.length ?? 0,
    },
    completedLessons: (course.completedLessons ?? []).map((lesson) => ({
      lessonId: lesson.lessonId,
      title: lesson.title,
      chapter: lesson.chapterTitle,
      chapterId: lesson.chapterId,
      xp: lesson.xp ?? 0,
      completedAt: formatDate(lesson.completedAt),
    })),
    savedCode: (course.savedCode ?? []).map((item) => ({
      lessonId: item.lessonId,
      updatedAt: formatDate(item.updatedAt),
      code: item.code ?? "",
    })),
    notes: (course.notes ?? []).map((item) => ({
      lessonId: item.lessonId,
      updatedAt: formatDate(item.updatedAt),
      note: item.note ?? "",
    })),
    bookmarks: course.bookmarks ?? [],
  };
}

function serializeDailyXp(dailyXp) {
  if (!dailyXp) {
    return {
      totalPoints: 0,
      totalXp: 0,
      unreadDays: 0,
      readBonusXp: 3,
      days: [],
    };
  }

  const days = (dailyXp.days ?? []).map((day) => ({
    date: day.date,
    pointsEarned: day.pointsEarned ?? day.xpEarned ?? 0,
    xpEarned: day.xpEarned ?? day.pointsEarned ?? 0,
    lessonPoints: day.lessonPoints ?? day.lessonXp ?? 0,
    lessonXp: day.lessonXp ?? day.lessonPoints ?? 0,
    readBonusPoints: day.readBonusPoints ?? day.readBonusXp ?? 0,
    readBonusXp: day.readBonusXp ?? day.readBonusPoints ?? 0,
    lessonsCompleted: day.lessonsCompleted ?? 0,
    courses: day.courses ?? [],
    lessons: (day.lessons ?? []).map((lesson) => ({
      lessonId: lesson.lessonId,
      course: lesson.course ?? "",
      title: lesson.title ?? "",
      points: lesson.points ?? lesson.xp ?? 0,
      xp: lesson.xp ?? lesson.points ?? 0,
      recordedAt: lesson.recordedAt ?? null,
    })),
    read: Boolean(day.read),
  }));

  const totalPoints = dailyXp.totalXp ?? 0;

  return {
    totalPoints,
    totalXp: totalPoints,
    unreadDays: dailyXp.unreadDays ?? 0,
    readBonusXp: dailyXp.readBonusXp ?? 3,
    days,
  };
}

function buildPointsByDay(dailyXp) {
  const serialized = serializeDailyXp(dailyXp);
  return serialized.days.map((day) => ({
    date: day.date,
    pointsEarned: day.pointsEarned,
    lessonPoints: day.lessonPoints,
    readBonusPoints: day.readBonusPoints,
    lessonsCompleted: day.lessonsCompleted,
    courses: day.courses,
    lessons: day.lessons,
    read: day.read,
  }));
}

function buildOverview({ user, languageProgress, oopsCppProgress, dailyXp }) {
  const languages = languageProgress || [];
  const oops = oopsCppProgress || {};

  return {
    languagesStarted: languages.length,
    languagesCompleted: languages.filter((entry) => entry.status === "completed")
      .length,
    languagesInProgress: languages.filter((entry) => entry.status === "in-progress")
      .length,
    totalMinutesSpent:
      languages.reduce((sum, entry) => sum + (entry.totalMinutesSpent || 0), 0) +
      (oops.totalMinutesSpent || 0),
    totalDocumentsCompleted: languages.reduce(
      (sum, entry) => sum + (entry.completedDocuments?.length || 0),
      0,
    ),
    completedLessonsCount: oops.completedLessons?.length || 0,
    oopsCppTotalXp: oops.totalXp || 0,
    dailyXpTotal: dailyXp?.totalXp || 0,
    currentStreak: Math.max(
      user?.currentStreak || 0,
      oops.currentStreak || 0,
      ...languages.map((entry) => entry.currentStreak || 0),
      0,
    ),
    highestStreak: user?.highestStreak || 0,
  };
}

/**
 * Aggregate PolyCode learning progress for a polycoder (username handle).
 * @param {string} username
 */
async function getProgressByUsername(username) {
  const polycoder = normalizeUsername(username);

  if (!isValidUsername(polycoder)) {
    const error = new Error("Polycoder not found");
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findOne({ username: polycoder, isActive: true }).lean();

  if (!user) {
    const error = new Error("Polycoder not found");
    error.statusCode = 404;
    throw error;
  }

  const userId = user._id;

  const [languageProgress, courseOops, legacyOops, dailyXp] = await Promise.all([
    UserProgress.find({ userId }).lean(),
    CourseProgress.findOne({ userId, courseId: "oops-cpp" }).lean(),
    OopsCppProgress.findOne({ userId }).lean(),
    dailyXpService.getDailyXp(userId),
  ]);

  const oopsCppProgress = courseOops || legacyOops;

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || polycoder;

  const profile = {
    id: String(userId),
    username: user.username,
    displayName,
    firstName,
    lastName,
    preferredLanguages: user.preferredLanguages || [],
    currentStreak: user.currentStreak || 0,
    highestStreak: user.highestStreak || 0,
    lastLogin: formatDate(user.lastLogin),
    memberSince: formatDate(user.createdAt),
  };

  const overview = buildOverview({
    user,
    languageProgress,
    oopsCppProgress,
    dailyXp,
  });

  const dailyXpPayload = serializeDailyXp(dailyXp);

  return {
    polycoder,
    generatedAt: new Date().toISOString(),
    profile,
    overview,
    languageTracks: (languageProgress || [])
      .map(serializeLanguageTrack)
      .filter(Boolean),
    courses: {
      oopsCpp: serializeOopsCpp(oopsCppProgress),
    },
    pointsByDay: buildPointsByDay(dailyXp),
    dailyXp: dailyXpPayload,
  };
}

async function getDailyPointsByUsername(username) {
  const progress = await getProgressByUsername(username);
  return {
    polycoder: progress.polycoder,
    generatedAt: progress.generatedAt,
    profile: {
      id: progress.profile.id,
      username: progress.profile.username,
      displayName: progress.profile.displayName,
    },
    totalPoints: progress.dailyXp.totalPoints,
    unreadDays: progress.dailyXp.unreadDays,
    readBonusXp: progress.dailyXp.readBonusXp,
    pointsByDay: progress.pointsByDay,
  };
}

module.exports = {
  getProgressByUsername,
  getDailyPointsByUsername,
};
