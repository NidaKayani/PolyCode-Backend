const fs = require("fs");
const path = require("path");

const LOG_PATH = path.resolve(__dirname, "../../../debug-807e54.log");

function agentLog({ location, message, data = {}, hypothesisId, runId = "pre-fix" }) {
  try {
    fs.appendFileSync(
      LOG_PATH,
      `${JSON.stringify({
        sessionId: "807e54",
        location,
        message,
        data,
        hypothesisId,
        runId,
        timestamp: Date.now(),
      })}\n`,
    );
  } catch {
    /* non-blocking */
  }
}

module.exports = { agentLog };
