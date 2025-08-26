export const cardStyles = {
  width: '100%',
  borderRadius: { xs: '16px', sm: '20px' },
  backgroundColor: '#FFFFFF',
  backgroundImage: 'none',
  color: '#212529',
  marginBottom: { xs: '1rem', sm: '1.5rem', md: '2rem' },
  position: 'relative' as const,
  boxShadow: {
    xs: '0 4px 12px rgba(0, 0, 0, 0.1)',
    sm: '0 6px 16px rgba(0, 0, 0, 0.12)',
    md: '0 8px 24px rgba(0, 0, 0, 0.12)'
  },
  overflow: 'visible' as const
}

export const badgeStyles = {
  width: { xs: '100px', sm: '120px', md: '140px', lg: '150px', xl: '160px' },
  height: { xs: '100px', sm: '120px', md: '140px', lg: '150px', xl: '160px' },
  display: 'block' as const,
  margin: '0 auto',
  marginTop: { xs: 2, sm: 2.5, md: 3 },
  marginBottom: { xs: 2, sm: 2.5, md: 3 },
  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}

export const titleStyles = {
  fontSize: { xs: '24px', sm: '28px', md: '32px', lg: '36px' },
  fontWeight: 600,
  marginBottom: { xs: 0.5, sm: 0.75, md: 1 },
  textAlign: 'center' as const,
  color: '#212529',
  fontFamily: 'Adamina, serif'
}

export const subtitleStyles = {
  fontSize: { xs: '12px', sm: '14px', md: '16px' },
  color: '#212529',
  marginBottom: { xs: 2, sm: 3, md: 4 },
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: { xs: '1px', sm: '1.5px', md: '2px' },
  fontFamily: 'Roboto, serif'
}

export const validationCardStyles = {
  p: { xs: 2, sm: 2.5 },
  boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
  borderRadius: { xs: 1.5, sm: 2 },
  fontWeight: 500,
  cursor: 'pointer',
  position: 'relative' as const,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)'
  },
  display: 'flex' as const,
  flexDirection: 'column' as const
}

export const actionButtonStyles = {
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 1,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: { xs: '10px 16px', sm: '12px 18px', md: '8px 16px' },
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  width: { xs: '100%', sm: '100%', md: 'auto' },
  '&:hover': {
    backgroundColor: 'rgba(45, 106, 79, 0.08)',
    transform: 'scale(1.02)'
  }
}

export const COLORS = {
  primary: '#2D6A4F',
  text: {
    primary: '#212529',
    secondary: '#495057'
  },
  background: {
    primary: '#FFFFFF',
    hover: 'rgba(45, 106, 79, 0.08)'
  }
}

export const getVisibleValidationCount = (isXs: boolean, isSm: boolean, isMd: boolean): number => {
  if (isXs) return 1
  if (isSm) return 2
  if (isMd) return 3
  return 4
}

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
  return videoExtensions.some(ext => url.toLowerCase().includes(ext))
}

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
} 