import config from "./env";

export const AI_CONFIG = {
  PROVIDER: "gemini",

  MODEL: config.gemini.model,

  PROMPT_VERSION: "v1",

  MAX_PROMPT_CHARACTERS: 120000,

  USE_MOCK_AI: config.ai.useMockAi,
};
