import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    formBackground: string
    textc: string
    icons: string
    button: string
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
  }
  interface PaletteOptions {
    formBackground?: string
    textc?: string
    icons?: string
    button?: string
    date?: string
    menuBackground?: string
    link?: string
    buttonHover?: string
    profileButton?: string
    dialogBackground?: string
    footerBackground?: string
    searchBarBackground?: string
    stars: string
    chipColor: string
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
    formBackground: '#0A1C1D',
    textc: '#ffffff',
    icons: '#009688',
    button: '#00695f',
    date: '#4C726F',
    menuBackground: '#172d2d',
    link: '#1976d2',
    buttonHover: '#00796b',
    profileButton: '#2f0101',
    dialogBackground: '#333333',
    footerBackground: '#1a1a1a',
    searchBarBackground: '#2b4746',
    stars: '#009688',
    chipColor: '#239a8e'
  },
  // typography: {
  //   fontFamily: 'Lato, Roboto, Inter, Poppins',
  //   customFormTextStep: {
  //     color: '#ffffff',
  //     textAlign: 'center',
  //     fontSize: '24px',
  //     fontStyle: 'normal',
  //     fontWeight: 400,
  //     lineHeight: 'normal',
  //     padding: '0 50px'
  //   },
  //   customSuccessText: {
  //     color: '#ffffff',
  //     textAlign: 'center',
  //     fontSize: '16px',
  //     fontStyle: 'italic',
  //     fontWeight: 500,
  //     lineHeight: 'normal'
  //   },
  //   customNoteText: {
  //     color: '#ffffff',
  //     textAlign: 'center',
  //     fontSize: '16px',
  //     fontStyle: 'italic',
  //     fontWeight: 400,
  //     lineHeight: 'normal'
  //   }
  // },
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
    formBackground: '#ffffff',
    textc: '#000000',
    icons: '#009688',
    button: '#1976d2',
    date: '#4C726F',
    menuBackground: '#f5f5f5',
    link: '#1976d2',
    buttonHover: '#00796b',
    profileButton: '#2f0101',
    dialogBackground: '#333333',
    footerBackground: '#fefefe',
    searchBarBackground: '#ffffff',
    stars: '#FFD700',
    chipColor: '#239a8e'
  },
  // typography: {
  //   fontFamily: 'Lato, Roboto, Inter, Poppins',
  //   customFormTextStep: {
  //     color: '#000000',
  //     textAlign: 'center',
  //     fontSize: '24px',
  //     fontStyle: 'normal',
  //     fontWeight: 400,
  //     lineHeight: 'normal',
  //     padding: '0 50px'
  //   },
  //   customSuccessText: {
  //     color: '#000000',
  //     textAlign: 'center',
  //     fontSize: '16px',
  //     fontStyle: 'italic',
  //     fontWeight: 500,
  //     lineHeight: 'normal'
  //   },
  //   customNoteText: {
  //     color: '#000000',
  //     textAlign: 'center',
  //     fontSize: '16px',
  //     fontStyle: 'italic',
  //     fontWeight: 400,
  //     lineHeight: 'normal'
  //   }
  // },
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
