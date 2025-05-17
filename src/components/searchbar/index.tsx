import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  TextField,
  IconButton,
  useMediaQuery,
  Popover,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useLocation, useNavigate } from 'react-router-dom'

const SearchBar = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const search = location.search
  const query = new URLSearchParams(search).get('query') ?? ''
  const type = new URLSearchParams(search).get('type') ?? ''
  const [searchVal, setSearchVal] = useState<string>(query)
  const [filterType, setFilterType] = useState<string>(type)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const isSmallScreen = useMediaQuery('(max-width: 900px)')
  const filterButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const currentQuery = new URLSearchParams(location.search).get('query') ?? ''
    const currentType = new URLSearchParams(location.search).get('type') ?? ''
    setSearchVal(currentQuery)
    setFilterType(currentType)
  }, [location.search])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchVal) params.set('query', searchVal)
    if (filterType) params.set('type', filterType)

    navigate({ pathname: '/feed', search: params.toString() }, { replace: true })
  }

  const handleSearchKeypress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchVal(newValue)
    if (newValue === '') {
      navigate({ pathname: location.pathname, search: '' })
    }
  }

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterType(event.target.value)
  }

  const openFilterMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const closeFilterMenu = () => {
    setAnchorEl(null)
  }

  const applyFilter = () => {
    handleSearch()
    closeFilterMenu()

    if (searchRef.current) {
      searchRef.current.style.border = '2px solid #5DAE7B'
      setTimeout(() => {
        if (searchRef.current) {
          searchRef.current.style.border = '1px solid #DEE2E6'
        }
      }, 300)
    }
  }

  const resetFilter = () => {
    setFilterType('')

    const params = new URLSearchParams()
    if (searchVal) params.set('query', searchVal)

    navigate({ pathname: '/feed', search: params.toString() }, { replace: true })
    closeFilterMenu()

    if (searchRef.current) {
      searchRef.current.style.border = '2px solid #5DAE7B'
      setTimeout(() => {
        if (searchRef.current) {
          searchRef.current.style.border = '1px solid #DEE2E6'
        }
      }, 300)
    }
  }

  const open = Boolean(anchorEl)

  return (
    <Box
      ref={searchRef}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 'clamp(155px, 25vw, 400px)',
        height: 'clamp(25px, 2.08vw, 40px)',
        backgroundColor: '#F8F9FA',
        border: '1px solid #DEE2E6',
        borderRadius: '6px',
        p: 0,
        transition: 'border 0.3s ease',
        ':hover': {
          border: '1px solid #2D6A4F'
        },
        ':focus-within': {
          border: '1px solid #2D6A4F'
        }
      }}
    >
      <IconButton
        type='button'
        sx={{
          ml: '12px',
          p: 0,
          color: '#495057',
          borderRadius: 0
        }}
        aria-label='search'
        onClick={handleSearch}
      >
        <SearchIcon />
      </IconButton>

      <TextField
        value={searchVal}
        onChange={handleInputChange}
        onKeyUp={handleSearchKeypress}
        variant='standard'
        placeholder='Search for Claims, Credentials...'
        sx={{
          flex: 1,
          fontFamily: 'Roboto',
          ml: 1,
          input: {
            fontSize: isSmallScreen ? '11px' : '14px',
            fontWeight: 500,
            color: '#495057',
            letterSpacing: '1px',
            fontFamily: 'Roboto'
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#495057',
            opacity: 1
          },
          '& .MuiInput-underline:before': {
            borderBottom: 'none !important'
          },
          '& .MuiInput-underline:after': {
            borderBottom: 'none !important'
          },
          '& .MuiInput-underline:hover:before': {
            borderBottom: 'none !important'
          },
          '& .MuiInput-underline.Mui-focused:after': {
            borderBottom: 'none !important'
          }
        }}
      />

      <IconButton
        type='button'
        sx={{
          p: 0,
          mr: '12px',
          color: '#495057',
          borderRadius: 0
        }}
        onClick={openFilterMenu}
        ref={filterButtonRef}
      >
        <FilterAltOutlinedIcon />
      </IconButton>

      {/* Filter Menu Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeFilterMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            width: '300px',
            borderRadius: '8px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            mt: 1
          }
        }}
      >
        <Box sx={{ position: 'relative', p: 3 }}>
          <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
            <IconButton onClick={closeFilterMenu} size='small'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>

          <Typography sx={{ textAlign: 'center', fontWeight: 700, mb: 2, fontSize: '16px' }}>Filter by:</Typography>

          <RadioGroup value={filterType} onChange={handleFilterChange} sx={{ mb: 2 }}>
            <FormControlLabel
              value='credentials'
              control={<Radio sx={{ color: '#2D6A4F', '&.Mui-checked': { color: '#2D6A4F' } }} />}
              label='Credentials Only'
              sx={{ mb: 1, color: '#2D6A4F' }}
            />
            <FormControlLabel
              value='validation'
              control={<Radio sx={{ color: '#2D6A4F', '&.Mui-checked': { color: '#2D6A4F' } }} />}
              label='Validations Only'
              sx={{ mb: 1, color: '#2D6A4F' }}
            />
            <FormControlLabel
              value='claim'
              control={<Radio sx={{ color: '#2D6A4F', '&.Mui-checked': { color: '#2D6A4F' } }} />}
              label='Claims Only'
              sx={{ color: '#2D6A4F' }}
            />
          </RadioGroup>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
            <Button
              variant='contained'
              onClick={applyFilter}
              fullWidth
              sx={{
                bgcolor: '#2D6A4F',
                borderRadius: '20px',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1E5038'
                }
              }}
            >
              Apply
            </Button>
            <Button
              variant='outlined'
              onClick={resetFilter}
              fullWidth
              sx={{
                border: '1px solid #2D6A4F',
                color: '#2D6A4F',
                borderRadius: '20px',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#1E5038',
                  color: '#1E5038'
                }
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  )
}

export default SearchBar
