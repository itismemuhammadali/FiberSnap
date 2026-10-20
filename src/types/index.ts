import { BiologicalSex } from '../constants/guidelines';
import { FiberTag } from '../constants/keywords';

export interface FoodEntry {
  id: string;
  name: string;
  totalGrams: number;
  solubleGrams: number;
  insolubleGrams: number;
  portion: string;
  source: 'usda' | 'ai_scan' | 'manual';
  tag: FiberTag;
  dateStr: string; // YYYY-MM-DD
  timestamp: number;
  imageUri?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  biologicalSex: BiologicalSex;
  age: number;
  weightKg?: number;
  weightUnit?: 'kg' | 'lbs';
  customTargetGrams: number;
  useCustomTarget: boolean;
  goalType?: 'standard' | 'weight_adjusted' | 'custom';
  isPlusSubscriber: boolean;
  subscriptionTier?: 'annual' | 'monthly';
  aiScanCount: number;
  avatarUri?: string;
  hasCompletedOnboarding?: boolean;
  hasGivenAiConsent?: boolean;
  dailyRemindersEnabled?: boolean;
  reminderTime?: string;
  createdAt: number;
}

export interface DaySummary {
  dateStr: string;
  totalGrams: number;
  solubleGrams: number;
  insolubleGrams: number;
  goal: number;
  metGoal: boolean;
}

export interface MonthSummary {
  monthStr: string;
  label: string;
  avgGrams: number;
  totalGrams: number;
  daysLogged: number;
  goal: number;
  metGoal: boolean;
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber?: string;
  unitName: string;
  value: number;
}

export interface USDAPortion {
  id?: number;
  amount?: number;
  gramWeight?: number;
  modifier?: string;
  measureUnit?: {
    name?: string;
  };
}

export interface USDASearchItem {
  fdcId: number;
  description: string;
  dataType?: string;
  foodNutrients: USDANutrient[];
  foodPortions?: USDAPortion[];
  servingSize?: number;
  servingSizeUnit?: string;
  fiberGrams: number;
  tag: FiberTag;
}

export interface GeminiScanResult {
  foodName: string;
  portion: string;
  total_fiber_g: number;
  soluble_fiber_g: number;
  insoluble_fiber_g: number;
  notes?: string;
  imageUri?: string;
}

export interface ProgressMetrics {
  currentStreak: number;
  rolling7DayAvg: number;
  daysMetGoalLast30: number;
  totalDaysLogged: number;
  totalEntriesCount: number;
}
