export class LevenshteinScorer {
  static computeDistance(s1: string, s2: string): number {
    const str1 = s1.trim().toLowerCase();
    const str2 = s2.trim().toLowerCase();

    if (str1 === str2) return 0;
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;

    let previousRow: number[] = Array.from({ length: str2.length + 1 }, (_, i) => i);
    let currentRow: number[] = new Array(str2.length + 1).fill(0);

    for (let i = 0; i < str1.length; i++) {
      currentRow[0] = i + 1;
      for (let j = 0; j < str2.length; j++) {
        const cost = str1[i] === str2[j] ? 0 : 1;
        currentRow[j + 1] = Math.min(
          currentRow[j] + 1, // Insertion
          previousRow[j + 1] + 1, // Deletion
          previousRow[j] + cost // Substitution
        );
      }
      for (let k = 0; k <= str2.length; k++) {
        previousRow[k] = currentRow[k];
      }
    }

    return previousRow[str2.length];
  }

  static calculateSimilarity(target: string, attempt: string): number {
    const cleanTarget = target.trim().toLowerCase();
    const cleanAttempt = attempt.trim().toLowerCase();

    if (!cleanTarget || !cleanAttempt) return 0.0;
    if (cleanTarget === cleanAttempt) return 100.0;

    const distance = this.computeDistance(cleanTarget, cleanAttempt);
    const maxLen = Math.max(cleanTarget.length, cleanAttempt.length);

    if (maxLen === 0) return 100.0;

    const similarityRatio = 1.0 - distance / maxLen;
    const scorePercentage = Math.min(100.0, Math.max(0.0, similarityRatio * 100.0));
    return parseFloat(scorePercentage.toFixed(1));
  }

  static getScoreColor(score: number): string {
    if (score >= 80.0) return '#22c55e'; // Green
    if (score >= 50.0) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  }

  static getScoreFeedbackLabel(score: number): string {
    if (score >= 90.0) return 'Native level accuracy!';
    if (score >= 80.0) return 'Great job! Clear pronunciation.';
    if (score >= 50.0) return 'Close attempt! Keep practicing.';
    return 'Needs practice! Try listening again.';
  }
}
