import { gemini } from "../lib/gemini";
import { AI_CONFIG } from "../config/ai.config";

import {
  ReviewResult,
  reviewResultSchema,
} from "./review-engine/review.response.validation";

import { mockReview } from "./review-engine/mock-review";

class AIService {
  async generateReview(prompt: string): Promise<ReviewResult> {
    console.log("process.env.USE_MOCK_AI =", process.env.USE_MOCK_AI);
    console.log("AI_CONFIG.USE_MOCK_AI =", AI_CONFIG.USE_MOCK_AI);
    if (AI_CONFIG.USE_MOCK_AI) {
      console.log("🤖 Using Mock AI");
      return mockReview;
    }

    console.log("🤖 Using Gemini");

    const response = await gemini.models.generateContent({
      model: AI_CONFIG.MODEL,
      contents: prompt,
    });

    const output = response.text;

    if (!output) {
      throw new Error("Gemini returned an empty response.");
    }

    return reviewResultSchema.parse(JSON.parse(output));
  }
}

export default new AIService();
