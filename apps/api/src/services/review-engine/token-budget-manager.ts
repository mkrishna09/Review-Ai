import { ParsedRepository } from "./review-engine.types";
import { AI_CONFIG } from "../../config/ai.config";

class TokenBudgetManager {
  /**
   * Approximate character budget.
   * We'll replace this with true token counting later.
   */

  fitRepository(repository: ParsedRepository): ParsedRepository {
    let currentCharacters = 0;

    const optimizedRepository: ParsedRepository = {
      files: [],
      totalFiles: repository.totalFiles,
      readme: repository.readme,
      packageJson: repository.packageJson,
    };

    // Reserve space for README
    if (repository.readme) {
      currentCharacters += repository.readme.length;
    }

    // Reserve space for package.json
    if (repository.packageJson) {
      currentCharacters += repository.packageJson.length;
    }

    // Add source files until we reach the budget
    for (const file of repository.files) {
      const fileSize = file.content.length;

      if (currentCharacters + fileSize > AI_CONFIG.MAX_PROMPT_CHARACTERS) {
        break;
      }

      optimizedRepository.files.push(file);
      currentCharacters += fileSize;
    }

    return optimizedRepository;
  }
}

export default new TokenBudgetManager();
