import Box from '@mui/material/Box'
import { TextField } from '@mui/material'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'

interface Props {
    searchVal: string;
    setSearchVal: (val: string) => void;
    handleSearchKeypress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleSearch: () => void;
    reset: () => void;
  }

const SearchField = ({searchVal,setSearchVal,handleSearchKeypress,handleSearch,reset}: Props) => {
  return (
    <Box sx={{ position: 'absolute', top: '10px', left: '2%', zIndex: 20 }}>
        <Box
          component='div'
          sx={{
            borderRadius: '0.3em',
            width: '500px',
            display: 'flex',
            alignItems: 'center',
            borderColor: 'black',
            borderWidth: '2px',
            height: '50px'
          }}
        >
          <TextField
            type='search'
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyUp={handleSearchKeypress}
            sx={{ width: '100%' }}
          />
          <Button
            style={{
              backgroundColor: '#333',
              fontWeight: 'bold',
              color: 'white',
              height: '100%',
              width: '60px',
              borderTopLeftRadius: '0.1em',
              borderBottomLeftRadius: '0.1em'
            }}
            onClick={handleSearch}
          >
            <SearchIcon />
          </Button>
        </Box>
        <Button
          variant='outlined'
          onClick={reset}
          sx={{
            backgroundColor: '#fff',
            color: '#333333',
            marginTop: '1rem',
            fontWeight: 'bold',
            border: '2px solid #333333',
            '&:hover': {
              backgroundColor: '#fff',
              border: '2px solid #333333',
              color: '#333333'
            }
          }}
          disableElevation
        >
          Reset
        </Button>
        </Box>
  )
}

export default SearchField