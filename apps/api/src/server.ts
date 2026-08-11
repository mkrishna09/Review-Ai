import "dotenv/config";

import "./jobs/review.worker";

import app from "./app";
import config from "./config/env";
import logger from "./logger/logger";

app.listen(config.port, () => {
  logger.info(
    `ReviewAI API running in ${config.nodeEnv} mode on port ${config.port}`,
  );
});
