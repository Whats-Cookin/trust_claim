import IconButton from '@mui/material/IconButton'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import NightsStayIcon from '@mui/icons-material/NightsStay'
import { useTheme } from '@mui/material/styles'
import { SxProps, Theme } from '@mui/material'

interface ThemeToggleButtonProps {
  toggleTheme: () => void
  isDarkMode: boolean
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ toggleTheme, isDarkMode }) => {
  const theme = useTheme()

  const transitionEffect: SxProps<Theme> = {
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.short
    })
  }

  return (
    <IconButton onClick={toggleTheme} color='inherit' aria-label='toggle theme'>
      {isDarkMode ? (
        <Brightness7Icon
          sx={{
            ...transitionEffect,
            transform: 'rotate(0deg)'
          }}
        />
      ) : (
        <NightsStayIcon
          sx={{
            ...transitionEffect,
            transform: 'rotate(-20deg)'
          }}
        />
      )}
    </IconButton>
  )
}

export default ThemeToggleButton
