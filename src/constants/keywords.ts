export type FiberTag = 'soluble' | 'insoluble' | 'mixed';

export const SOLUBLE_REGEX =
  /psyllium|flax|oat|prune|orange|citrus|carrot|lentil|bean|split pea|chickpea|garbanzo/i;

export const INSOLUBLE_REGEX =
  /whole wheat|whole grain|bran|quinoa|barley|brown rice|popcorn|almond|walnut|pistachio|peanut|seed\b|broccoli|brussels|potato|corn\b|spinach|cauliflower|cabbage|kale|celery/i;

export const BALANCED_REGEX =
  /banana|chia|berry|berries|apple|pear|avocado|fig|guava|kiwi|edamame/i;

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
 * Accurately determines whether a food is Soluble, Insoluble,
 * or Mixed based on its actual biochemical fiber gram split.
 * - When both soluble and insoluble fiber are present in meaningful amounts (a split),
 *   it is categorized as 'mixed'.
 * - Categorized as 'soluble' only when insoluble fiber is negligible (<= 0.2g or < 10% of total fiber).
 * - Categorized as 'insoluble' only when soluble fiber is negligible (<= 0.2g or < 10% of total fiber).
 */
export function getFiberTagFromGrams(solubleGrams: number, insolubleGrams: number): FiberTag {
  const sol = Math.max(0, Number(solubleGrams) || 0);
  const ins = Math.max(0, Number(insolubleGrams) || 0);
  const total = sol + ins;
  if (total <= 0) return 'mixed';

  // If one type is negligible (<= 0.2g or < 10% of total fiber and <= 0.5g), classify as that single type
  if (ins <= 0.2 || (ins / total < 0.1 && ins <= 0.5)) {
    return 'soluble';
  }
  if (sol <= 0.2 || (sol / total < 0.1 && sol <= 0.5)) {
    return 'insoluble';
  }

  // When both soluble and insoluble fiber are present (a split), it is always 'mixed'
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
    // Pure/Overwhelmingly Soluble (e.g. psyllium, pectins): ~90% soluble, 10% insoluble
    const sol = Math.round(total * 0.9 * 10) / 10;
    const ins = Math.round((total - sol) * 10) / 10;
    return { solubleGrams: sol, insolubleGrams: ins };
  }
  if (tag === 'insoluble') {
    // Pure/Overwhelmingly Insoluble (e.g. wheat bran, cellulose): ~90% insoluble, 10% soluble
    const ins = Math.round(total * 0.9 * 10) / 10;
    const sol = Math.round((total - ins) * 10) / 10;
    return { solubleGrams: sol, insolubleGrams: ins };
  }
  // Balanced / Mixed: 50% / 50%
  const half = Math.round((total / 2) * 10) / 10;
  return { solubleGrams: half, insolubleGrams: Math.round((total - half) * 10) / 10 };
}

