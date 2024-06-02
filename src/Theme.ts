import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    formBackground: string
    texts: string
    icons: string
    buttons: string
    date: string
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
  }

  interface PaletteOptions {
    formBackground?: string
    texts?: string
    icons?: string
    buttons?: string
    date?: string
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

const darkModeTheme = createTheme({
  palette: {
    mode: 'dark',
    smallButton: '#4C726F',
    buttons: '#009688',
    buttonHover: '#00695f',
    buttontext: '#ffffff',
    cardsbuttons: '#ffffff',
    maintext: '#009688',
    icons: '#009688',
    stars: '#009688',
    footerBackground: '#0A1C1D',
    footerText: '#ffffff',
    menuBackground: '#172d2d',
    pageBackground: '#0A1C1D',
    formBackground: '#0A1C1D',
    formMainText: '#ffffff',
    cardBackground: '#4C726F33',
    cardBackgroundBlur: '#43434380',
    texts: '#ffffff',
    date: '#4C726F',
    link: '#1976d2',
    profileButton: '#2f0101',
    dialogBackground: '#333333',
    searchBarBackground: '#4C726F80',
    searchBarText: '#DFDFDF',
    chipColor: '#4C726F',
    borderColor: '#008a7cdc',
    shadows: '#00000040'
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 800,
      lg: 1280,
      xl: 1920
    }
  }
})

const lightModeTheme = createTheme({
  palette: {
    mode: 'light',
    smallButton: '#797979',
    buttons: '#009688',
    buttonHover: '#00695f',
    buttontext: '#ffffff',
    cardsbuttons: '#0A1C1D',
    maintext: '#00796B',
    icons: '#00796B',
    stars: '#009688',
    footerBackground: '#ffffff',
    footerText: '#0A1C1D',
    menuBackground: '#ffffff',
    pageBackground: '#ffffff',
    formBackground: '#ffffff',
    formMainText: '#000000',
    cardBackground: '#ffffff',
    cardBackgroundBlur: '#79797933',
    texts: '#000000',
    date: '#797979B2',
    link: '#1565C0',
    profileButton: '#D32F2F',
    dialogBackground: '#ffffff',
    searchBarBackground: '#79797933',
    searchBarText: '#797979',
    chipColor: '#B2DFDB',
    borderColor: '#00796B80',
    shadows: '#00000020'
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 800,
      lg: 1280,
      xl: 1920
    }
  }
})

export { darkModeTheme, lightModeTheme }
