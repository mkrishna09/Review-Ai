import { REVIEW_PROMPT } from "./prompt-template";
import { ParsedRepository } from "./review-engine.types";

class PromptBuilder {
  buildReviewPrompt(repository: ParsedRepository): string {
    const sections: string[] = [];

    sections.push(REVIEW_PROMPT);

    sections.push(`
Repository Information

Files Analysed: ${repository.totalFiles}

README Included: ${repository.readme ? "Yes" : "No"}

Package.json Included: ${repository.packageJson ? "Yes" : "No"}

`);

    if (repository.readme) {
      sections.push(`
========================
README.md
========================

${repository.readme}
`);
    }

    if (repository.packageJson) {
      sections.push(`
========================
package.json
========================

${repository.packageJson}
`);
    }

    for (const file of repository.files) {
      sections.push(`
========================
${file.path}
========================

${file.content}
`);
    }

    return sections.join("\n\n");
  }
}

export default new PromptBuilder();
