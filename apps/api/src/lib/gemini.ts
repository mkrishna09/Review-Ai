import { GoogleGenAI } from "@google/genai";
import config from "../config/env";

export const gemini = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
});
