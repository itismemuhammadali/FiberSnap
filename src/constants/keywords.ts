export type FiberTag = 'soluble' | 'insoluble' | 'mixed';

export const SOLUBLE_REGEX =
  /psyllium|chia|flax|oat|prune|banana|orange|citrus|carrot|lentil|bean|split pea|chickpea|garbanzo/i;

export const INSOLUBLE_REGEX =
  /whole wheat|whole grain|bran|quinoa|barley|brown rice|popcorn|almond|walnut|pistachio|peanut|seed\b|broccoli|brussels|potato|corn\b|spinach|cauliflower|cabbage|kale|celery/i;

export const BALANCED_REGEX =
  /berry|berries|apple|pear|avocado|fig|guava|kiwi|edamame/i;

export function classifyFiberType(foodName: string): FiberTag {
  if (!foodName) return 'mixed';
  if (BALANCED_REGEX.test(foodName)) {
    return 'mixed';
  }
  if (SOLUBLE_REGEX.test(foodName)) {
    return 'soluble';
  }
  if (INSOLUBLE_REGEX.test(foodName)) {
    return 'insoluble';
  }
  return 'mixed';
}

/**
 * Accurately determines whether a food is Soluble-dominant, Insoluble-dominant,
 * or Mixed based on its actual biochemical fiber gram split.
 * - Soluble dominant: >= 67% (two-thirds) soluble
 * - Insoluble dominant: >= 67% (two-thirds) insoluble
 * - Mixed: both soluble and insoluble are present in significant amounts (33% - 67%)
 */
export function getFiberTagFromGrams(solubleGrams: number, insolubleGrams: number): FiberTag {
  const sol = Math.max(0, Number(solubleGrams) || 0);
  const ins = Math.max(0, Number(insolubleGrams) || 0);
  const total = sol + ins;
  if (total <= 0) return 'mixed';

  const solRatio = sol / total;
  const insRatio = ins / total;

  if (solRatio >= 0.67) return 'soluble';
  if (insRatio >= 0.67) return 'insoluble';
  return 'mixed';
}

/**
 * Calculates estimated soluble and insoluble grams from total fiber grams and tag
 */
export function estimateFiberSplit(
  totalGrams: number,
  tag: FiberTag
): { solubleGrams: number; insolubleGrams: number } {
  const total = Math.max(0, totalGrams);
  if (tag === 'soluble') {
    // Soluble dominant: ~70% soluble, 30% insoluble
    const sol = Math.round(total * 0.7 * 10) / 10;
    const ins = Math.round((total - sol) * 10) / 10;
    return { solubleGrams: sol, insolubleGrams: ins };
  }
  if (tag === 'insoluble') {
    // Insoluble dominant: ~70% insoluble, 30% soluble
    const ins = Math.round(total * 0.7 * 10) / 10;
    const sol = Math.round((total - ins) * 10) / 10;
    return { solubleGrams: sol, insolubleGrams: ins };
  }
  // Balanced / Mixed: 50% / 50%
  const half = Math.round((total / 2) * 10) / 10;
  return { solubleGrams: half, insolubleGrams: Math.round((total - half) * 10) / 10 };
}
