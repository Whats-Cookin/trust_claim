import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import IDropdownProps from "./types";

const Dropdown = ({
  label,
  value,
  setter,
  options,
  variant,
  sx,
}: IDropdownProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    setter(event.target.value as string);
  };

  return (
    <Box sx={sx}>
      <FormControl fullWidth variant="filled">
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={value}
          onChange={handleChange}
          variant={variant}
        >
          {options.map((option: string) => (
            <MenuItem value={option} key={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Dropdown;
