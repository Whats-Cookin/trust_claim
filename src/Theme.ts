import { createTheme } from '@mui/material/styles'
import { primaryColors, darkColors, neutralColors, uiColors, linkedTrustTheme } from './theme/colors'

declare module '@mui/material/styles' {
  interface Mixins {
    bottomNav: { height: number }
  }
  interface MixinsOptions {
    bottomNav?: { height: number }
  }

  interface Palette {
    formBackground: string
    texts: string
    icons: string
    buttons: string
    date: string
    cardDate: string
    menuBackground: string
    link: string
    buttonHover: string
    profileButton: string
    dialogBackground: string
    footerBackground: string
    searchBarBackground: string
    stars: string
    chipColor: string
    smallButton: string
    buttontext: string
    footerText: string
    pageBackground: string
    formMainText: string
    cardBackground: string
    searchBarText: string
    maintext: string
    cardBackgroundBlur: string
    borderColor: string
    shadows: string
    cardsbuttons: string
    sidecolor: string
    darkinputtext: string
    input: string
  }

  interface PaletteOptions {
    formBackground?: string
    texts?: string
    icons?: string
    buttons?: string
    date?: string
    cardDate?: string
    menuBackground?: string
    link?: string
    buttonHover?: string
    profileButton?: string
    dialogBackground?: string
    footerBackground?: string
    searchBarBackground?: string
    stars?: string
    chipColor?: string
    smallButton?: string
    buttontext?: string
    footerText?: string
    pageBackground?: string
    formMainText?: string
    cardBackground?: string
    searchBarText?: string
    maintext?: string
    cardBackgroundBlur?: string
    borderColor?: string
    shadows?: string
    cardsbuttons?: string
    sidecolor?: string
    darkinputtext?: string
    input: string
  }

  interface TypographyVariants {
    customFormTextStep: React.CSSProperties
    customSuccessText: React.CSSProperties
    customNoteText: React.CSSProperties
  }

  interface TypographyVariantsOptions {
    customFormTextStep?: React.CSSProperties
    customSuccessText?: React.CSSProperties
    customNoteText?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    customFormTextStep: true
    customSuccessText: true
    customNoteText: true
  }
}

const radius = linkedTrustTheme.borderRadius

// Shared between light and dark: type scale, shape, component defaults.
// body1/body2 are one size at every width so a component's fontSize is what renders.
const baseTheme = {
  typography: {
    fontFamily: 'Montserrat',
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
    button: { textTransform: 'none' as const, fontWeight: 600 }
  },
  shape: { borderRadius: parseInt(radius.md, 10) },
  mixins: {
    // Fixed bottom navigation on phones; pages clear it with this height plus the safe-area inset.
    bottomNav: { height: 56 }
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1280, xl: 1920 }
  }
}

const baseComponents = {
  MuiCard: { styleOverrides: { root: { borderRadius: radius.lg, backgroundImage: 'none' } } },
  MuiLink: { defaultProps: { underline: 'hover' as const } }
}

const darkModeTheme = createTheme({
  ...baseTheme,
  components: {
    ...baseComponents,
    MuiCssBaseline: {
      styleOverrides: `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 100px ${neutralColors.gray[800]} inset !important;
      -webkit-text-fill-color: ${neutralColors.white} !important;
      border-top-left-radius: initial !important;
      border-top-right-radius: initial !important;
      }
      `
    }
  },
  palette: {
    mode: 'dark',
    primary: { main: primaryColors.cyan, contrastText: neutralColors.gray[900] },
    background: {
      default: neutralColors.gray[900],
      paper: neutralColors.gray[800]
    },
    text: {
      primary: neutralColors.white,
      secondary: neutralColors.gray[300],
      disabled: neutralColors.gray[500]
    },
    divider: neutralColors.gray[700],
    smallButton: neutralColors.gray[600],
    buttons: primaryColors.green,
    buttonHover: darkColors.green,
    buttontext: neutralColors.white,
    cardsbuttons: `${darkColors.green}40`,
    maintext: primaryColors.green,
    icons: primaryColors.green,
    stars: primaryColors.amber,
    footerBackground: neutralColors.gray[900],
    footerText: neutralColors.white,
    menuBackground: neutralColors.gray[800],
    pageBackground: neutralColors.gray[900],
    formBackground: neutralColors.gray[800],
    formMainText: neutralColors.white,
    cardBackground: neutralColors.gray[800],
    cardBackgroundBlur: `${neutralColors.gray[700]}80`,
    texts: neutralColors.white,
    date: neutralColors.gray[400],
    cardDate: neutralColors.gray[300],
    link: primaryColors.cyan,
    profileButton: primaryColors.red,
    dialogBackground: neutralColors.gray[700],
    searchBarBackground: `${neutralColors.gray[600]}80`,
    searchBarText: neutralColors.gray[200],
    chipColor: neutralColors.gray[600],
    borderColor: `${primaryColors.green}dc`,
    shadows: `${neutralColors.gray[900]}40`,
    sidecolor: neutralColors.white,
    darkinputtext: neutralColors.white,
    input: neutralColors.gray[700]
  }
})

const lightModeTheme = createTheme({
  ...baseTheme,
  components: {
    ...baseComponents,
    MuiCssBaseline: {
      styleOverrides: `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 100px ${neutralColors.white} inset !important;
      -webkit-text-fill-color: ${uiColors.textPrimary} !important;
      border-top-left-radius: initial !important;
      border-top-right-radius: initial !important;
      }
      `
    }
  },
  palette: {
    mode: 'light',
    primary: { main: uiColors.linkText, light: primaryColors.cyan, contrastText: neutralColors.white },
    background: {
      default: uiColors.pageBg,
      paper: uiColors.cardBg
    },
    text: {
      primary: uiColors.textPrimary,
      secondary: uiColors.textSecondary,
      disabled: uiColors.textMuted
    },
    divider: uiColors.border,
    smallButton: neutralColors.gray[500],
    buttons: primaryColors.green,
    buttonHover: darkColors.green,
    buttontext: neutralColors.white,
    cardsbuttons: neutralColors.gray[100], // Light grey for button backgrounds
    maintext: darkColors.green,
    icons: darkColors.green,
    stars: primaryColors.amber,
    footerBackground: neutralColors.gray[100],
    footerText: uiColors.textPrimary,
    menuBackground: neutralColors.white, // Clean white background
    pageBackground: uiColors.pageBg,
    formBackground: neutralColors.white,
    formMainText: uiColors.textPrimary,
    cardBackground: uiColors.cardBg,
    cardBackgroundBlur: `${neutralColors.gray[400]}33`,
    texts: uiColors.textPrimary,
    date: uiColors.textMuted,
    link: primaryColors.cyan,
    profileButton: primaryColors.red,
    dialogBackground: neutralColors.white,
    searchBarBackground: `${neutralColors.gray[400]}33`,
    searchBarText: uiColors.textSecondary,
    chipColor: neutralColors.gray[100], // Light grey for chips
    borderColor: uiColors.border,
    shadows: uiColors.shadow,
    sidecolor: uiColors.textPrimary,
    darkinputtext: uiColors.textPrimary,
    input: neutralColors.gray[100]
  }
})

export { darkModeTheme, lightModeTheme }
