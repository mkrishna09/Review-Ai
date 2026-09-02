import assert from "node:assert/strict";
import test from "node:test";
import { extractJsonFromText } from "./ai.service";

test("ai.service: extractJsonFromText extracts raw valid JSON", () => {
  const raw = `{"summary": "Looks good", "overallScore": 90}`;
  const extracted = extractJsonFromText(raw);
  assert.equal(extracted, `{"summary": "Looks good", "overallScore": 90}`);
  assert.deepEqual(JSON.parse(extracted), {
    summary: "Looks good",
    overallScore: 90,
  });
});

test("ai.service: extractJsonFromText strips markdown code fences", () => {
  const raw = `\`\`\`json
{
  "summary": "Clean code",
  "overallScore": 85
}
\`\`\``;
  const extracted = extractJsonFromText(raw);
  assert.deepEqual(JSON.parse(extracted), {
    summary: "Clean code",
    overallScore: 85,
  });
});

test("ai.service: extractJsonFromText extracts JSON surrounded by commentary", () => {
  const raw = `Here is your review result:

\`\`\`json
{
  "summary": "Great separation of concerns",
  "overallScore": 95
}
\`\`\`

Let me know if you have questions!`;
  const extracted = extractJsonFromText(raw);
  assert.deepEqual(JSON.parse(extracted), {
    summary: "Great separation of concerns",
    overallScore: 95,
  });
});
