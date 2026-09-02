import IORedis from "ioredis";
import config from "../config/env";
import logger from "../logger/logger";

export const redis = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
  lazyConnect: false,
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

redis.on("ready", () => {
  logger.info("Redis client ready to process commands");
});

redis.on("reconnecting", (delay: number) => {
  logger.warn(`Redis reconnecting in ${delay}ms`);
});

redis.on("error", (error) => {
  logger.error("Redis client encountered an error", { error });
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});
