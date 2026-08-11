export const AI_CONFIG = {
  PROVIDER: "gemini",

  MODEL: "gemini-3.6-flash",

  PROMPT_VERSION: "v1",

  MAX_PROMPT_CHARACTERS: 120000,

  USE_MOCK_AI: process.env.USE_MOCK_AI === "true",
};
