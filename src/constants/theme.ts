import { Platform } from 'react-native';

// Exact color tokens from _reference/fibersnap.html and fibersnap-logo_2.html

export interface ThemeColors {
  // Page & Backgrounds
  bg: string;            // App background (--bg: #F9F6F1 in light, #1E1E16 in dark)
  pageBg: string;        // Outside frame (--page-bg: #EEE9DC in light, #151510 in dark)
  surface: string;       // Cards & panels (--surface: #FFFFFF in light, #26261E in dark)
  surface2: string;      // Input fields, tracks (--surface-2: #F1ECE0 in light, #2D2D23 in dark)
  border: string;        // Card & divider borders (--border: #E6DFCF in light, #3A3A2C in dark)
  borderSubtle: string;

  // Inks & Typography
  ink: string;           // Primary text (--ink: #2B2A1E in light, #EFEDE0 in dark)
  inkSoft: string;       // Secondary text (--ink-soft: #6B6A57 in light, #A9A88F in dark)
  inkFaint: string;      // Tertiary / hint (--ink-faint: #9B9A86 in light, #75745E in dark)
  inkWhite: string;

  // Brand Accents
  accent: string;        // Topbar / primary buttons (--accent: #74895A in light, #93AC72 in dark)
  accentDeep: string;    // Deep olive (--accent-deep: #57693F in light, #A9C088 in dark)
  accentSoft: string;    // Soft tint (--accent-soft: #E4EAD8 in light, #333F29 in dark)
  accentInk: string;     // Text on topbar (--accent-ink: #FFFFFF in light, #16160F in dark)

  // Pod & Pea (from logo_2)
  pod: string;           // #E3F1E0
  pea: string;           // #3F8F4F
  peaDeep: string;       // #2C6B39

  // Fiber Types (from fibersnap.html)
  soluble: string;       // --soluble: #74895A in light, #93AC72 in dark
  solubleLight: string;
  insoluble: string;     // --insoluble: #5C7C99 in light, #7FA3C2 in dark
  insolubleLight: string;

  // Semantic
  danger: string;        // --danger: #B5533E in light, #D98A73 in dark
  dangerSoft: string;    // --danger-soft: #F3E1DA in light, #3A2620 in dark
  warning: string;
  warningSoft: string;
  success: string;
  successSoft: string;
  // Aliases for backward compatibility
  background: string;
  surfaceSubtle: string;
  surfaceAccent: string;
  inkSecondary: string;
  podLight: string;
  isDark: boolean;
}

export const LIGHT_THEME: ThemeColors = {
  bg: '#F9F6F1',
  background: '#F9F6F1',
  pageBg: '#EDEAE0',
  surface: '#FFFFFF',
  surface2: '#F1ECE0',
  surfaceSubtle: '#F1ECE0',
  surfaceAccent: '#E3F1E0',
  border: '#E6DFCF',
  borderSubtle: '#EFEBE1',

  ink: '#1B2A1F',
  inkSoft: '#5B6B5D',
  inkSecondary: '#5B6B5D',
  inkFaint: '#8B9B8D',
  inkWhite: '#FFFFFF',

  // The 3 iconic green brand colors from logo_2 and paywall:
  accent: '#2C6B39',        // Deep forest green (--pea-deep)
  accentDeep: '#1E4E28',    // Rich dark forest green
  accentSoft: '#E3F1E0',    // Soft fresh pod mint (--pod)
  accentInk: '#FFFFFF',     // Crisp white text on primary buttons & headers

  pod: '#E3F1E0',           // Soft fresh pod mint
  podLight: '#EAF5E8',
  pea: '#3F8F4F',           // Vibrant pea green (--pea)
  peaDeep: '#2C6B39',       // Deep forest green

  soluble: '#3F8F4F',       // Vibrant pea green for soluble fiber
  solubleLight: '#E8F5E9',
  insoluble: '#5C7C99',     // Insoluble blue
  insolubleLight: '#EDF3F8',

  danger: '#B5533E',
  dangerSoft: '#F8E7E4',
  warning: '#C27803',
  warningSoft: '#FEF3C7',
  success: '#2C6B39',
  successSoft: '#E3F1E0',
  isDark: false,
};

export const DARK_THEME: ThemeColors = {
  bg: '#1E1E16',
  background: '#1E1E16',
  pageBg: '#151510',
  surface: '#26261E',
  surface2: '#2D2D23',
  surfaceSubtle: '#2D2D23',
  surfaceAccent: '#333F29',
  border: '#3A3A2C',
  borderSubtle: '#444434',

  ink: '#EFEDE0',
  inkSoft: '#A9A88F',
  inkSecondary: '#A9A88F',
  inkFaint: '#75745E',
  inkWhite: '#FFFFFF',

  accent: '#93AC72',
  accentDeep: '#A9C088',
  accentSoft: '#333F29',
  accentInk: '#16160F',

  pod: '#333F29',
  podLight: '#333F29',
  pea: '#93AC72',
  peaDeep: '#A9C088',

  soluble: '#93AC72',
  solubleLight: '#2F3C28',
  insoluble: '#7FA3C2',
  insolubleLight: '#283644',

  danger: '#D98A73',
  dangerSoft: '#3A2620',
  warning: '#F59E0B',
  warningSoft: '#3B2D17',
  success: '#93AC72',
  successSoft: '#2D3A24',
  isDark: true,
};

export const FONTS = {
  // Client specification from fibersnap.html:
  // var(--font-serif): Georgia, 'Times New Roman', Times, serif
  // var(--font-sans): -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
  serifItalic: Platform.select({
    ios: 'Georgia-Italic',
    android: 'serif',
    default: 'Georgia',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
};

export const COLORS = LIGHT_THEME;

export const RADIUS = {
  sm: 8,
  md: 12,
  card: 20,
  pill: 999,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#2B2A1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#2B2A1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
};

