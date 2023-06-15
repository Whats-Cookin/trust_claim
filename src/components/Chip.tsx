import React, { useEffect } from 'react'
import { Theme, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import data from './Form'
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

const names = ['Impact', 'Quality', 'Test', 'RelationShip']

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  }
}

export default function MultipleSelectChip() {
  const theme = useTheme()
  const [personName, setPersonName] = React.useState<string[]>([])

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value }
    } = event

    let selectedValues = value as string[]

    // Truncate the selected values to a maximum of 2
    if (selectedValues.length > 2) {
      selectedValues = selectedValues.slice(0, 3)
    }

    setPersonName(selectedValues)
  }

  const use = personName.slice(1)

  useEffect(() => {
    console.log(personName)
    console.log(use)
  }, [personName])
  return (
    <div>
      <FormControl sx={{ m: 1, width: 250 }}>
        <InputLabel id='demo-multiple-chip-label'>Asp</InputLabel>
        <Select
          multiple
          labelId='demo-multiple-chip-label'
          id='demo-multiple-chip'
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput id='select-multiple-chip' label='Chip' />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={value} sx={{ cursor: 'pointer' }} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {personName.length === 0 &&
            names.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          {personName[0] == ('Quality' || data.quality.includes('journalistic')) &&
            data.quality.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          {personName[0] == ('Test' || data.test.includes('justice')) &&
            data.test.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          {personName[0] == ('RelationShip' || data.relationShip.includes('same-as')) &&
            data.relationShip.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          {personName[0] == ('Impact' || data.impact.includes('climate')) &&
            data.impact.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  )
}
