import React from 'react'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'

import IDropdownProps from './types'

const Dropdown = ({ label, value, setter, options, variant, sx }: IDropdownProps) => {
  const handleChange = (event: { target: { value: string } }) => {
    setter(event.target.value)
  }

  return (
    <Box sx={sx}>
      <FormControl fullWidth>
        <InputLabel sx={{ ml: 2, mr: 2 }}>{label}</InputLabel>
        <Select value={value} label={label} onChange={handleChange} variant={variant}>
          {options.map(option => (
            <MenuItem value={option} key={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default Dropdown
