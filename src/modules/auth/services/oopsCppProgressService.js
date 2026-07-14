const courseProgress = require("./courseProgressService");

const COURSE_ID = "oops-cpp";

async function getProgress(userId) {
  return courseProgress.getProgress(userId, COURSE_ID);
}

async function completeLesson(userId, lesson) {
  return courseProgress.completeLesson(userId, COURSE_ID, lesson);
}

async function setLastLesson(userId, lessonId) {
  return courseProgress.setLastLesson(userId, COURSE_ID, lessonId);
}

async function saveCode(userId, lessonId, code) {
  return courseProgress.saveCode(userId, COURSE_ID, lessonId, code);
}

async function saveNote(userId, lessonId, note) {
  return courseProgress.saveNote(userId, COURSE_ID, lessonId, note);
}

async function toggleBookmark(userId, lessonId) {
  return courseProgress.toggleBookmark(userId, COURSE_ID, lessonId);
}

async function addTime(userId, minutes) {
  return courseProgress.addTime(userId, COURSE_ID, minutes);
}

module.exports = {
  getProgress,
  completeLesson,
  setLastLesson,
  saveCode,
  saveNote,
  toggleBookmark,
  addTime,
};
