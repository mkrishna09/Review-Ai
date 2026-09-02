import { gemini } from "../lib/gemini";
import { AI_CONFIG } from "../config/ai.config";
import logger from "../logger/logger";

import {
  ReviewResult,
  reviewResultSchema,
} from "./review-engine/review.response.validation";

import { mockReview } from "./review-engine/mock-review";

/**
 * Extracts and cleans JSON content from model responses, stripping markdown fences
 * or leading/trailing commentary if present.
 */
export function extractJsonFromText(rawText: string): string {
  let cleaned = rawText.trim();

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();
  }

  // Find outermost JSON object boundaries { ... }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

class AIService {
  async generateReview(prompt: string): Promise<ReviewResult> {
    if (AI_CONFIG.USE_MOCK_AI) {
      logger.info(
        "AI Service: using mock review generation (USE_MOCK_AI is true)",
      );
      return mockReview;
    }

    logger.info(
      `AI Service: requesting code review from Gemini model: ${AI_CONFIG.MODEL}`,
    );

    const response = await gemini.models.generateContent({
      model: AI_CONFIG.MODEL,
      contents: prompt,
    });

    const output = response.text;

    if (!output || output.trim() === "") {
      throw new Error("Gemini returned an empty response.");
    }

    const jsonString = extractJsonFromText(output);

    try {
      const parsedJson = JSON.parse(jsonString);
      return reviewResultSchema.parse(parsedJson);
    } catch (parseError) {
      logger.error("Failed to parse Gemini output as structured ReviewResult", {
        parseError,
        rawOutputSnippet: output.slice(0, 300),
      });
      throw new Error(
        `Failed to parse AI review output: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      );
    }
  }
}

export default new AIService();
