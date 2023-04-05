import { Search, SearchIconWrapper, StyledInputBase } from "./styles";
import SearchIcon from "@mui/icons-material/Search";
import ISearchWrapper from "./types";

const SearchWrapper = ({
  onKeyUp,
  onChange,
  onSearchIconClick,
  value,
}: ISearchWrapper) => (
  <Search>
    <StyledInputBase
      placeholder="Search for claims..."
      inputProps={{ "aria-label": "search" }}
      onKeyUp={onKeyUp}
      onChange={onChange}
      value={value}
    />
    <SearchIconWrapper onClick= {onSearchIconClick} data-testid="search-icon">
   
      <SearchIcon />
    </SearchIconWrapper>
  </Search>
);

export default SearchWrapper;
