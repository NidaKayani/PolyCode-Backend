const { assertCourseId } = require("../constants/courseIds");
const {
  getOrCreateLearnerDoc,
  saveLearnerDoc,
} = require("./learnerProgressStore");

const MAX_PAYLOAD_BYTES = 100 * 1024;

function estimateSize(payload) {
  return Buffer.byteLength(JSON.stringify(payload || {}), "utf8");
}

function downsampleStroke(stroke, stride = 2) {
  const points = Array.isArray(stroke?.points) ? stroke.points : [];
  if (points.length <= 40 || stride <= 1) {
    return {
      color: stroke?.color || "",
      width: Number(stroke?.width) || 3,
      points,
    };
  }
  const next = [];
  for (let index = 0; index < points.length; index += stride) {
    next.push(points[index]);
  }
  const last = points[points.length - 1];
  const prev = next[next.length - 1];
  if (!prev || prev[0] !== last[0] || prev[1] !== last[1]) {
    next.push(last);
  }
  return {
    color: stroke?.color || "",
    width: Number(stroke?.width) || 3,
    points: next,
  };
}

function sanitizeAnnotation(raw = {}) {
  const strokes = Array.isArray(raw.strokes)
    ? raw.strokes.map((stroke) => downsampleStroke(stroke, 1))
    : [];
  const labels = Array.isArray(raw.labels)
    ? raw.labels.map((label, index) => ({
        id: String(label?.id || `label-${index}`),
        x: Number(label?.x) || 0,
        y: Number(label?.y) || 0,
        text: String(label?.text || "").slice(0, 2000),
      }))
    : [];
  return { strokes, labels };
}

function fitWithinLimit(payload) {
  let current = sanitizeAnnotation(payload);
  let size = estimateSize(current);
  if (size <= MAX_PAYLOAD_BYTES) {
    return { data: current, size, downsampled: false };
  }

  let stride = 2;
  while (size > MAX_PAYLOAD_BYTES && stride <= 16) {
    current = {
      strokes: (payload.strokes || []).map((stroke) =>
        downsampleStroke(stroke, stride),
      ),
      labels: current.labels,
    };
    size = estimateSize(current);
    stride *= 2;
  }

  if (size > MAX_PAYLOAD_BYTES) {
    const error = new Error(
      `Annotation payload exceeds ${MAX_PAYLOAD_BYTES} bytes even after downsampling`,
    );
    error.statusCode = 413;
    throw error;
  }

  return { data: current, size, downsampled: true };
}

function normalizeTab(tab) {
  return tab === "challenge" ? "challenge" : "theory";
}

function findAnnotation(learner, courseId, lessonId, tab) {
  return (learner.annotations || []).find(
    (row) =>
      row.courseId === courseId &&
      row.lessonId === lessonId &&
      row.tab === tab,
  );
}

async function getAnnotation(userId, courseId, lessonId, tab = "theory") {
  const id = assertCourseId(courseId);
  const cleanLessonId = String(lessonId || "").trim();
  const cleanTab = normalizeTab(tab);
  const learner = await getOrCreateLearnerDoc(userId);
  const doc = findAnnotation(learner, id, cleanLessonId, cleanTab);

  if (!doc) {
    return {
      courseId: id,
      lessonId: cleanLessonId,
      tab: cleanTab,
      strokes: [],
      labels: [],
      updatedAt: null,
    };
  }

  return {
    courseId: doc.courseId,
    lessonId: doc.lessonId,
    tab: doc.tab,
    strokes: doc.strokes || [],
    labels: doc.labels || [],
    updatedAt: doc.updatedAt || null,
  };
}

async function putAnnotation(userId, courseId, lessonId, tab, payload = {}) {
  const id = assertCourseId(courseId);
  const cleanLessonId = String(lessonId || "").trim();
  if (!cleanLessonId) {
    const error = new Error("lessonId is required");
    error.statusCode = 400;
    throw error;
  }

  const cleanTab = normalizeTab(tab);
  const fitted = fitWithinLimit(payload);
  const learner = await getOrCreateLearnerDoc(userId);
  let doc = findAnnotation(learner, id, cleanLessonId, cleanTab);

  if (!doc) {
    learner.annotations.push({
      courseId: id,
      lessonId: cleanLessonId,
      tab: cleanTab,
      strokes: fitted.data.strokes,
      labels: fitted.data.labels,
      updatedAt: new Date(),
    });
    doc = learner.annotations[learner.annotations.length - 1];
  } else {
    doc.strokes = fitted.data.strokes;
    doc.labels = fitted.data.labels;
    doc.updatedAt = new Date();
  }

  await saveLearnerDoc(learner);

  return {
    courseId: doc.courseId,
    lessonId: doc.lessonId,
    tab: doc.tab,
    strokes: doc.strokes || [],
    labels: doc.labels || [],
    updatedAt: doc.updatedAt || null,
    downsampled: fitted.downsampled,
    size: fitted.size,
  };
}

async function mergeLocalAnnotations(userId, items = []) {
  const results = [];
  for (const item of items) {
    try {
      const saved = await putAnnotation(
        userId,
        item.courseId,
        item.lessonId,
        item.tab,
        { strokes: item.strokes, labels: item.labels },
      );
      results.push({ ok: true, ...saved });
    } catch (error) {
      results.push({
        ok: false,
        courseId: item.courseId,
        lessonId: item.lessonId,
        tab: item.tab,
        error: error.message,
      });
    }
  }
  return results;
}

module.exports = {
  getAnnotation,
  putAnnotation,
  mergeLocalAnnotations,
  MAX_PAYLOAD_BYTES,
};
