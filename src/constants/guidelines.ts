export type BiologicalSex = 'female' | 'male';

export interface TargetGuideline {
  sex: BiologicalSex;
  minAge: number;
  maxAge: number;
  recommendedGrams: number;
  label: string;
}

export const ADULT_GUIDELINES: TargetGuideline[] = [
  { sex: 'female', minAge: 19, maxAge: 50, recommendedGrams: 25, label: 'Women (19–50)' },
  { sex: 'female', minAge: 51, maxAge: 120, recommendedGrams: 21, label: 'Women (51+)' },
  { sex: 'male', minAge: 19, maxAge: 50, recommendedGrams: 38, label: 'Men (19–50)' },
  { sex: 'male', minAge: 51, maxAge: 120, recommendedGrams: 30, label: 'Men (51+)' },
];

export function calculateStandardTarget(sex: BiologicalSex, age: number): number {
  const safeAge = Math.max(1, isNaN(age) ? 30 : age);
  if (sex === 'male') {
    return safeAge <= 50 ? 38 : 30;
  }
  return safeAge <= 50 ? 25 : 21;
}

export function calculateWeightAdjustedTarget(weightKg: number): number {
  if (!weightKg || isNaN(weightKg) || weightKg < 25) return 28.0;
  const weightBased = Math.round(weightKg * 0.4 * 10) / 10;
  return Math.min(50, Math.max(20, weightBased));
}

export function calculateDailyTarget(
  sex: BiologicalSex,
  age: number,
  weightKg?: number,
  goalType: 'standard' | 'weight_adjusted' | 'custom' = 'standard'
): number {
  if (goalType === 'weight_adjusted' && weightKg && !isNaN(weightKg) && weightKg >= 25) {
    return calculateWeightAdjustedTarget(weightKg);
  }
  return calculateStandardTarget(sex, age);
}

export interface CitationItem {
  id: string;
  category: 'guidelines' | 'weight' | 'cardio' | 'metabolic' | 'gut' | 'nutrition';
  categoryLabel: string;
  title: string;
  authors: string;
  source: string;
  year: number;
  doiOrUrl?: string;
  keyFinding: string;
  appApplication: string;
}

export const CLINICAL_CITATIONS: CitationItem[] = [
  {
    id: 'iom-dri-2005',
    category: 'guidelines',
    categoryLabel: 'Age & Sex Recommended Targets',
    title: 'Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids',
    authors: 'Institute of Medicine (IOM), Food and Nutrition Board',
    source: 'National Academies Press, Washington, DC',
    year: 2005,
    doiOrUrl: 'https://doi.org/10.17226/10490',
    keyFinding: 'Established the Adequate Intake (AI) benchmark of 14 grams of dietary fiber per 1,000 kcal consumed. Formulates the standard adult targets: 38g/day for men ≤50, 30g/day for men 51+, 25g/day for women ≤50, and 21g/day for women 51+.',
    appApplication: 'Directly powers FiberSnap’s Standard Target recommendations for male and female age brackets.',
  },
  {
    id: 'howarth-weight-2001',
    category: 'weight',
    categoryLabel: 'Body Weight & Satiety',
    title: 'Dietary Fiber and Weight Regulation',
    authors: 'Howarth, N. C., Saltzman, E., & Roberts, S. B.',
    source: 'Nutrition Reviews, 59(5), 129–139',
    year: 2001,
    doiOrUrl: 'https://doi.org/10.1111/j.1753-4887.2001.tb07001.x',
    keyFinding: 'Comprehensive review demonstrating that an increase of 14g/day dietary fiber is associated with a 10% decrease in total caloric energy intake and a mean body weight reduction of 1.9 kg over 3.8 months, with enhanced benefits in individuals with higher baseline adiposity.',
    appApplication: 'Underpins FiberSnap’s Body Weight-Tailored goal algorithm (~0.4g/kg) and healthy weight-management progress tracking.',
  },
  {
    id: 'slavin-weight-2005',
    category: 'weight',
    categoryLabel: 'Body Weight Regulation Mechanisms',
    title: 'Dietary fiber and body weight',
    authors: 'Slavin, J. L.',
    source: 'Nutrition, 21(3), 411–418',
    year: 2005,
    doiOrUrl: 'https://doi.org/10.1016/j.nut.2004.08.018',
    keyFinding: 'Analyzes physiological mechanisms whereby fiber promotes fullness: prolonged mastication, delayed gastric emptying, expanded gastric volume, and enhanced secretion of satiety hormones (GLP-1 and PYY). Confirms that metabolic caloric needs scale with body mass, justifying weight-tailored fiber targets.',
    appApplication: 'Direct scientific rationale for FiberSnap’s real-time body weight adjustment slider and decimal precision calculation.',
  },
  {
    id: 'nejm-mozaffarian-2011',
    category: 'weight',
    categoryLabel: 'Long-Term Weight Gain Prevention',
    title: 'Changes in Diet and Lifestyle and Long-Term Weight Gain in Women and Men',
    authors: 'Mozaffarian, D., Hao, T., Rimm, E. B., Willett, W. C., & Hu, F. B.',
    source: 'The New England Journal of Medicine (NEJM), 364(25), 2392–2404',
    year: 2011,
    doiOrUrl: 'https://doi.org/10.1056/NEJMoa1014296',
    keyFinding: 'Large-scale prospective cohort across 120,877 adults followed over 20 years. Independent of exercise and sleep, each standard daily increase in dietary fiber intake was associated with a 0.77 lb (0.35 kg) lower 4-year weight gain, establishing fiber as one of the single most protective lifestyle dietary factors against obesity.',
    appApplication: 'Grounding for FiberSnap’s 30-Day consistency tracking grid and long-term adherence streaks.',
  },
  {
    id: 'chambers-gut-2015',
    category: 'weight',
    categoryLabel: 'Appetite & Gut Hormone Signaling',
    title: 'Effects of targeted delivery of propionate to the human colon on appetite regulation, body weight maintenance and adiposity in overweight adults',
    authors: 'Chambers, E. S., Viardot, A., Psichas, A., et al.',
    source: 'Gut, 64(11), 1744–1754',
    year: 2015,
    doiOrUrl: 'https://doi.org/10.1136/gutjnl-2014-307913',
    keyFinding: 'Demonstrated in human clinical trials that colonic microbial fermentation of dietary fiber into Short-Chain Fatty Acids (SCFAs: propionate) stimulates intestinal L-cells to release anorexigenic hormones PYY and GLP-1, producing an acute 14% reduction in ad libitum meal intake and preventing abdominal adipose accumulation.',
    appApplication: 'Connects FiberSnap’s soluble/prebiotic nutrient breakdown to natural hormonal appetite control.',
  },
  {
    id: 'post-diabetes-2012',
    category: 'metabolic',
    categoryLabel: 'Metabolic & Blood Sugar Wellness',
    title: 'Dietary Fiber for the Treatment of Type 2 Diabetes Mellitus: A Meta-Analysis',
    authors: 'Post, R. E., Mainous, A. G., King, D. E., & Simpson, K. N.',
    source: 'The Journal of the American Board of Family Medicine (JABFM), 25(1), 16–23',
    year: 2012,
    doiOrUrl: 'https://doi.org/10.3122/jabfm.2012.01.110148',
    keyFinding: 'Meta-analysis of randomized controlled trials finding that high dietary fiber intake significantly reduces glycosylated hemoglobin (HbA1c by -0.55%) and fasting plasma glucose (by -9.97 mg/dL) compared with standard control diets in individuals with type 2 diabetes.',
    appApplication: 'Validates FiberSnap’s metabolic wellness tips.',
  },
  {
    id: 'usda-dga-2020',
    category: 'guidelines',
    categoryLabel: 'Dietary Guidelines for Americans',
    title: 'Dietary Guidelines for Americans, 2020–2025 (9th Edition)',
    authors: 'U.S. Department of Agriculture (USDA) & U.S. Dept of Health and Human Services (HHS)',
    source: 'DietaryGuidelines.gov',
    year: 2020,
    doiOrUrl: 'https://www.dietaryguidelines.gov',
    keyFinding: 'Designates dietary fiber as a "Nutrient of Public Health Concern" due to pervasive underconsumption. Over 90% of American women and 97% of men do not meet recommended fiber minimums.',
    appApplication: 'Informs FiberSnap’s educational progress indicators and motivating streaks to close the dietary fiber deficit.',
  },
  {
    id: 'lancet-meta-2019',
    category: 'cardio',
    categoryLabel: 'Cardiovascular & Metabolic Health',
    title: 'Carbohydrate quality and human health: a series of systematic reviews and meta-analyses',
    authors: 'Reynolds, A., Mann, J., Cummings, J., Winter, N., Mete, E., & Te Morenga, L.',
    source: 'The Lancet, 393(10170), 434–445',
    year: 2019,
    doiOrUrl: 'https://doi.org/10.1016/S0140-6736(18)31809-9',
    keyFinding: 'Comprehensive meta-analysis of 185 prospective studies and 58 clinical trials. Found a 15–30% reduction in all-cause mortality, coronary heart disease, stroke incidence, type 2 diabetes, and colorectal cancer in high vs. low fiber consumers, with steepest benefits between 25g–35g daily.',
    appApplication: 'Underpins the importance of consistency tracked in the FiberSnap 30-Day Progress Grid.',
  },
  {
    id: 'ajcn-cholesterol-1999',
    category: 'cardio',
    categoryLabel: 'Soluble Fiber & Cholesterol',
    title: 'Cholesterol-lowering effects of dietary fiber: a meta-analysis',
    authors: 'Brown, L., Rosner, B., Willett, W. W., & Sacks, F. M.',
    source: 'The American Journal of Clinical Nutrition, 69(1), 30–42',
    year: 1999,
    doiOrUrl: 'https://doi.org/10.1093/ajcn/69.1.30',
    keyFinding: 'Demonstrates that soluble viscous fiber (including oat beta-glucan, psyllium, and pectin) significantly lowers total and LDL cholesterol without negatively lowering beneficial HDL cholesterol or altering triglycerides.',
    appApplication: 'Powers FiberSnap’s dedicated Soluble Fiber calculation and split ratios on the Today and Sources screens.',
  },
  {
    id: 'whelton-bp-2005',
    category: 'cardio',
    categoryLabel: 'Blood Pressure & Vascular Health',
    title: 'Effect of dietary fiber on blood pressure: a meta-analysis of randomized, controlled clinical trials',
    authors: 'Whelton, S. P., Hyre, A. D., Pedersen, B., Yi, Y., Whelton, P. K., & He, J.',
    source: 'Annals of Internal Medicine, 142(9), 793–802',
    year: 2005,
    doiOrUrl: 'https://doi.org/10.7326/0003-4819-142-9-200505030-00007',
    keyFinding: 'Meta-analysis of 24 randomized controlled trials demonstrating that dietary fiber supplementation significantly reduces systolic blood pressure by -1.15 mm Hg and diastolic blood pressure by -1.65 mm Hg, with even greater reductions in hypertensive adults (-5.95 / -4.20 mm Hg).',
    appApplication: 'Validates FiberSnap’s cardiovascular wellness tips.',
  },
  {
    id: 'who-guideline-2023',
    category: 'guidelines',
    categoryLabel: 'Global Health Standards',
    title: 'Carbohydrate intake for adults and children: WHO guideline',
    authors: 'World Health Organization (WHO)',
    source: 'Geneva: World Health Organization',
    year: 2023,
    doiOrUrl: 'https://www.who.int/publications/i/item/9789240073593',
    keyFinding: 'Recommends all adults consume at least 25g of naturally occurring dietary fiber daily primarily from vegetables, pulses/legumes, whole fruit, and minimally processed intact grains.',
    appApplication: 'Guides our focus on whole-food nutrient tracking rather than isolated synthetic fillers.',
  },
  {
    id: 'cell-microbiome-2018',
    category: 'gut',
    categoryLabel: 'Microbiome & Digestive Health',
    title: 'The Impact of Dietary Fiber on Gut Microbiota in Host Health and Disease',
    authors: 'Makki, K., Deehan, E. C., Walter, J., & Bäckhed, F.',
    source: 'Cell Host & Microbe, 23(6), 705–715',
    year: 2018,
    doiOrUrl: 'https://doi.org/10.1016/j.chom.2018.05.012',
    keyFinding: 'Explains how fermentable plant fibers nourish probiotic colonic bacteria to synthesize Short-Chain Fatty Acids (SCFAs: butyrate, acetate, propionate), fueling colonocytes and suppressing chronic gut inflammation.',
    appApplication: 'Guides the prebiotic educational tips and high-fiber food champion spotlights in FiberSnap.',
  },
  {
    id: 'bmj-colorectal-2011',
    category: 'gut',
    categoryLabel: 'Insoluble Fiber & Colorectal Health',
    title: 'Dietary fibre, whole grains, and risk of colorectal cancer: systematic review and dose-response meta-analysis',
    authors: 'Aune, D., Chan, D. S., Lau, R., et al.',
    source: 'BMJ (British Medical Journal), 343, d6617',
    year: 2011,
    doiOrUrl: 'https://doi.org/10.1136/bmj.d6617',
    keyFinding: 'Identified a linear dose-response relationship: each additional 10g/day increment of dietary fiber was associated with a 10% risk reduction in colorectal malignancies.',
    appApplication: 'Reinforces the Insoluble Fiber tracking metric for optimal digestive motility and bowel regularity.',
  },
  {
    id: 'usda-fooddata-2024',
    category: 'nutrition',
    categoryLabel: 'Nutrition Database',
    title: 'FoodData Central: Standard Reference Legacy & Foundation Foods',
    authors: 'U.S. Department of Agriculture (USDA), Agricultural Research Service (ARS)',
    source: 'USDA ARS FoodData Central',
    year: 2024,
    doiOrUrl: 'https://fdc.nal.usda.gov',
    keyFinding: 'Provides standardized, laboratory-verified macronutrient and dietary fiber analytical measurements across thousands of whole foods and ingredients.',
    appApplication: 'Serves as FiberSnap’s live nutritional search engine and foundational nutrient verification system.',
  },
];

export const CITATIONS = CLINICAL_CITATIONS.map((c) => ({
  title: c.title,
  detail: `${c.authors}. ${c.source}, ${c.year}.`,
}));

export const HEALTH_TIPS = [
  'Soluble fiber (found in oats, beans, chia seeds, and fruits) forms a gel in water, helping to lower LDL cholesterol and steady blood sugar levels.',
  'Insoluble fiber (found in whole grains, nuts, and vegetable skins) adds bulk to stool and speeds passage of food through the digestive tract.',
  'Increase fiber gradually and drink plenty of water to give your digestive microbiome time to adjust smoothly.',
  'Clinical studies in Nutrition Reviews show that adding 14g/day fiber reduces spontaneous calorie intake by 10% through natural satiety.',
  'Colonic fermentation of prebiotic fibers produces Short-Chain Fatty Acids (propionate & butyrate) that stimulate fullness hormones GLP-1 and PYY.',
  'A 20-year Harvard prospective study in the NEJM identified dietary fiber as one of the most effective lifestyle factors preventing age-related weight gain.',
];
