const User = require("../models/User");
const courseProgressService = require("./courseProgressService");
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

function serializeCourseRow(course) {
  if (!course) return null;
  return {
    courseId: course.courseId,
    lastLessonId: course.lastLessonId ?? null,
    stats: {
      totalXp: course.totalXp ?? 0,
      minutesSpent: course.totalMinutesSpent ?? 0,
      currentStreak: course.currentStreak ?? 0,
      lastActive: formatDate(course.lastActiveDate),
      bookmarksCount: course.bookmarks?.length ?? 0,
      completedCount: course.completedLessons?.length ?? 0,
      lessonsRead: (course.lessonEngagement || []).filter((row) => row.read).length,
      quizAnswered: (course.lessonEngagement || []).reduce(
        (sum, row) => sum + Object.keys(row.quizAttempts || {}).length,
        0,
      ),
    },
    completedLessons: (course.completedLessons ?? []).map((lesson) => ({
      lessonId: lesson.lessonId,
      title: lesson.title,
      chapter: lesson.chapterTitle,
      chapterId: lesson.chapterId,
      xp: lesson.xp ?? 0,
      completedAt: formatDate(lesson.completedAt),
    })),
    bookmarks: course.bookmarks ?? [],
  };
}

function buildOverview({ user, courseDocs, dailyXp }) {
  const courses = courseDocs || [];
  const courseXp = courses.reduce((sum, doc) => sum + (doc.totalXp || 0), 0);
  const courseMinutes = courses.reduce(
    (sum, doc) => sum + (doc.totalMinutesSpent || 0),
    0,
  );
  const courseStreaks = courses.map((doc) => doc.currentStreak || 0);
  const lessonsRead = courses.reduce(
    (sum, doc) =>
      sum + (doc.lessonEngagement || []).filter((row) => row.read).length,
    0,
  );
  const quizAnswered = courses.reduce(
    (sum, doc) =>
      sum +
      (doc.lessonEngagement || []).reduce(
        (inner, row) => inner + Object.keys(row.quizAttempts || {}).length,
        0,
      ),
    0,
  );

  return {
    languagesStarted: 0,
    languagesCompleted: 0,
    languagesInProgress: 0,
    totalMinutesSpent: courseMinutes,
    totalDocumentsCompleted: 0,
    completedLessonsCount: courses.reduce(
      (sum, doc) => sum + (doc.completedLessons?.length || 0),
      0,
    ),
    coursesStarted: courses.filter(
      (doc) =>
        (doc.completedLessons || []).length > 0 ||
        (doc.bookmarks || []).length > 0 ||
        Boolean(doc.lastLessonId),
    ).length,
    courseXpTotal: courseXp,
    lessonsRead,
    quizAnswered,
    dailyXpTotal: dailyXp?.totalXp || 0,
    currentStreak: Math.max(
      user?.currentStreak || 0,
      ...courseStreaks,
      0,
    ),
    highestStreak: user?.highestStreak || 0,
    oopsCppTotalXp:
      courses.find((doc) => doc.courseId === "oops-cpp")?.totalXp || 0,
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

  const [courseDocs, dailyXp] = await Promise.all([
    courseProgressService.listProgressForUser(userId, { includePrivate: true }),
    dailyXpService.getDailyXp(userId),
  ]);

  const oopsCppProgress =
    courseDocs.find((doc) => doc.courseId === "oops-cpp") || null;

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
    courseDocs,
    dailyXp,
  });

  const dailyXpPayload = serializeDailyXp(dailyXp);
  const coursesById = {};
  for (const doc of courseDocs) {
    coursesById[doc.courseId] = serializeCourseRow(doc);
  }
  coursesById.oopsCpp = serializeOopsCpp(oopsCppProgress);

  return {
    polycoder,
    generatedAt: new Date().toISOString(),
    profile,
    overview,
    languageTracks: [],
    courses: coursesById,
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
