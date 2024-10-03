import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
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

const darkModeTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 100px #172D2D inset !important;
      -webkit-text-fill-color: #ffffff !important;
      border-top-left-radius: initial !important;
      border-top-right-radius: initial !important;
      }
      `
    }
  },
  typography: {
    fontFamily: 'Montserrat'
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#0A1C1D'
    },
    smallButton: '#4C726F',
    buttons: '#009688',
    buttonHover: '#00695f',
    buttontext: '#ffffff',
    cardsbuttons: '#223B3A',
    maintext: '#009688',
    icons: '#009688',
    stars: '#009688',
    footerBackground: '#0A1C1D',
    footerText: '#ffffff',
    menuBackground: '#172d2d',
    pageBackground: '#0A1C1D',
    formBackground: '#172D2D',
    formMainText: '#ffffff',
    cardBackground: '#223B3A',
    cardBackgroundBlur: '#43434380',
    texts: '#ffffff',
    date: '#96B1AC',
    cardDate: '#B7B7B7',
    link: '#009688',
    profileButton: '#2f0101',
    dialogBackground: '#333333',
    searchBarBackground: '#4C726F80',
    searchBarText: '#DFDFDF',
    chipColor: '#4C726F',
    borderColor: '#008a7cdc',
    shadows: '#00000040',
    sidecolor: '#ffffff',
    darkinputtext: '#ffffff',
    input: '#425655'
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1280,
      xl: 1920
    }
  }
})

const lightModeTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 100px #ffffff inset !important;
      -webkit-text-fill-color: #0A1C1D !important;
      border-top-left-radius: initial !important;
      border-top-right-radius: initial !important;
      }
      `
    }
  },
  typography: {
    fontFamily: 'Montserrat'
  },
  palette: {
    mode: 'light',
    background: {
      default: '#F2FAF9'
    },
    smallButton: '#797979',
    buttons: '#009688',
    buttonHover: '#00695f',
    buttontext: '#ffffff',
    cardsbuttons: '#00968833',
    maintext: '#00796B',
    icons: '#00796B',
    stars: '#009688',
    footerBackground: '#43434380',
    footerText: '#0A1C1D',
    menuBackground: '#D5E7E4',
    pageBackground: '#F2FAF9',
    formBackground: '#ffffff',
    formMainText: '#000000',
    cardBackground: '#ffffff',
    cardBackgroundBlur: '#79797933',
    texts: '#000000',
    date: '#797979',
    link: '#1565C0',
    profileButton: '#D32F2F',
    dialogBackground: '#ffffff',
    searchBarBackground: '#79797933',
    searchBarText: '#797979',
    chipColor: '#B2DFDB',
    borderColor: '#00796B80',
    shadows: '#00000020',
    sidecolor: '#0A1C1D',
    darkinputtext: '#0A1C1D',
    input: '#E6F0EE'
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1280,
      xl: 1920
    }
  }
})

export { darkModeTheme, lightModeTheme }
