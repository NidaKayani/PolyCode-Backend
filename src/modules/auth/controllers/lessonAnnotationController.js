const lessonAnnotation = require("../services/lessonAnnotationService");

function statusFromError(error) {
  return error.statusCode || 400;
}

async function getAnnotation(req, res) {
  try {
    const annotation = await lessonAnnotation.getAnnotation(
      req.userId,
      req.params.courseId,
      req.params.lessonId,
      req.query.tab,
    );
    res.json({ annotation });
  } catch (error) {
    res.status(statusFromError(error)).json({ error: error.message });
  }
}

async function putAnnotation(req, res) {
  try {
    const { strokes, labels, tab } = req.body || {};
    const annotation = await lessonAnnotation.putAnnotation(
      req.userId,
      req.params.courseId,
      req.params.lessonId,
      tab || req.query.tab,
      { strokes, labels },
    );
    res.json({ annotation });
  } catch (error) {
    res.status(statusFromError(error)).json({ error: error.message });
  }
}

async function mergeAnnotations(req, res) {
  try {
    const items = Array.isArray(req.body?.annotations)
      ? req.body.annotations
      : [];
    const results = await lessonAnnotation.mergeLocalAnnotations(
      req.userId,
      items,
    );
    res.json({ results });
  } catch (error) {
    res.status(statusFromError(error)).json({ error: error.message });
  }
}

module.exports = {
  getAnnotation,
  putAnnotation,
  mergeAnnotations,
};
