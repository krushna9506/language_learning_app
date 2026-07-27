import { Lesson, UserProgress } from '../types';

export class LeitnerService {
  static computeNextBox(currentBox: number, isSuccess: boolean): number {
    if (!isSuccess) return 1; // Drop to box 1 on failure
    return Math.min(5, Math.max(1, currentBox + 1));
  }

  static getReviewIntervalDays(box: number): number {
    switch (box) {
      case 1: return 1;
      case 2: return 2;
      case 3: return 4;
      case 4: return 7;
      case 5: return 14;
      default: return 1;
    }
  }

  static isLessonDue(progress: UserProgress): boolean {
    if (!progress.lastReviewed) return true;
    const daysInterval = this.getReviewIntervalDays(progress.leitnerBox);
    const nextDueDate = new Date(new Date(progress.lastReviewed).getTime() + daysInterval * 86400000);
    return new Date() > nextDueDate;
  }

  static prioritizeQueue(lessons: Lesson[], progressMap: Record<string, UserProgress>): Lesson[] {
    const sorted = [...lessons];
    sorted.sort((a, b) => {
      const progA = progressMap[a.id] || { lessonId: a.id, leitnerBox: 1, pronunciationScore: 0, quizScore: 0 };
      const progB = progressMap[b.id] || { lessonId: b.id, leitnerBox: 1, pronunciationScore: 0, quizScore: 0 };

      const dueA = this.isLessonDue(progA);
      const dueB = this.isLessonDue(progB);

      if (dueA !== dueB) return dueA ? -1 : 1;
      if (progA.leitnerBox !== progB.leitnerBox) return progA.leitnerBox - progB.leitnerBox;

      if (!progA.lastReviewed) return -1;
      if (!progB.lastReviewed) return 1;
      return new Date(progA.lastReviewed).getTime() - new Date(progB.lastReviewed).getTime();
    });
    return sorted;
  }
}
