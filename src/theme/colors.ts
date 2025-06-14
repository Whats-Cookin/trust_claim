// LinkedTrust Unified Color Palette
// All colors should be imported from this file for consistency

// Base colors from logo
export const primaryColors = {
  cyan: '#22D3EE',
  purple: '#8B5CF6',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6'
} as const

// Light variations (10-20% opacity) for backgrounds
export const lightColors = {
  cyan: {
    10: '#E0F2FE',
    20: '#BAE6FD',
    30: '#7DD3FC'
  },
  purple: {
    10: '#F3E8FF',
    20: '#E9D5FF',
    30: '#DDD6FE'
  },
  green: {
    10: '#D1FAE5',
    20: '#A7F3D0',
    30: '#6EE7B7'
  },
  amber: {
    10: '#FEF3C7',
    20: '#FDE68A',
    30: '#FCD34D'
  },
  red: {
    10: '#FEE2E2',
    20: '#FECACA',
    30: '#FCA5A5'
  }
} as const

// Dark variations for text on light backgrounds
export const darkColors = {
  cyan: '#0369A1',
  purple: '#6B21A8',
  green: '#065F46',
  amber: '#78350F',
  red: '#7F1D1D'
} as const

// Neutral colors
export const neutralColors = {
  white: '#FFFFFF',
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'
  }
} as const

// Semantic colors
export const semanticColors = {
  primary: primaryColors.cyan,
  secondary: primaryColors.purple,
  success: primaryColors.green,
  warning: primaryColors.amber,
  danger: primaryColors.red,
  info: primaryColors.cyan
} as const

// UI-specific colors
export const uiColors = {
  // Headers and navigation
  headerBg: neutralColors.white, // Clean white header
  headerText: darkColors.green,
  headerBorder: neutralColors.gray[200], // Light grey border

  // Backgrounds
  pageBg: neutralColors.gray[50],
  cardBg: neutralColors.white,
  sidebarBg: neutralColors.gray[100],

  // Text
  textPrimary: neutralColors.gray[900],
  textSecondary: neutralColors.gray[700],
  textMuted: neutralColors.gray[500],

  // Borders
  border: neutralColors.gray[200],
  borderHover: neutralColors.gray[300],

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowHover: 'rgba(0, 0, 0, 0.12)'
} as const

// Node colors for graph - darker, more professional palette
export const nodeColors = {
  claim: '#7C3AED', // Violet-600
  default: '#059669', // Emerald-600
  person: '#0891B2', // Cyan-600
  organization: '#4F46E5', // Indigo-600
  impact: '#D97706', // Amber-600
  event: '#DC2626', // Red-600
  document: '#4B5563', // Gray-600
  product: '#0D9488', // Teal-600
  place: '#DB2777' // Pink-600
} as const

// Edge colors by claim type - restore original colors
export const edgeColors = {
  is_vouched_for: primaryColors.green,
  rated: primaryColors.cyan,
  funds_for_purpose: primaryColors.amber,
  same_as: neutralColors.gray[400],
  validated: darkColors.green,
  verified: darkColors.green,
  impact: primaryColors.amber,
  agree: primaryColors.green,
  default: neutralColors.gray[400]
} as const

// Export a complete theme object
export const linkedTrustTheme = {
  colors: {
    primary: primaryColors,
    light: lightColors,
    dark: darkColors,
    neutral: neutralColors,
    semantic: semanticColors,
    ui: uiColors,
    node: nodeColors,
    edge: edgeColors
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },
  shadows: {
    sm: `0 1px 2px ${uiColors.shadow}`,
    md: `0 4px 6px ${uiColors.shadow}`,
    lg: `0 10px 15px ${uiColors.shadow}`,
    xl: `0 20px 25px ${uiColors.shadow}`
  }
} as const

export default linkedTrustTheme
