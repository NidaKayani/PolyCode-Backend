const User = require("../models/User");
const courseProgressService = require("./courseProgressService");

/**
 * Get user dashboard stats from User + LearnerProgress courses.
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Dashboard stats
 */
async function getUserDashboardStats(userId) {
  const user = await User.findById(userId);
  const courses = await courseProgressService.listProgressForUser(userId, {
    includePrivate: true,
  });

  const totalMinutesSpent = courses.reduce(
    (sum, course) => sum + (course.totalMinutesSpent || 0),
    0,
  );
  const totalDocumentsCompleted = courses.reduce(
    (sum, course) => sum + (course.completedLessons || []).length,
    0,
  );
  const currentStreak = Math.max(
    user?.currentStreak || 0,
    ...courses.map((course) => course.currentStreak || 0),
    0,
  );

  return {
    user: user ? user.toJSON() : null,
    totalLanguagesStarted: 0,
    languagesCompleted: 0,
    languagesInProgress: 0,
    totalMinutesSpent,
    totalDocumentsCompleted,
    currentStreak,
    coursesStarted: courses.filter(
      (course) =>
        (course.completedLessons || []).length > 0 ||
        (course.bookmarks || []).length > 0 ||
        Boolean(course.lastLessonId),
    ).length,
    languages: [],
  };
}

module.exports = {
  getUserDashboardStats,
};
