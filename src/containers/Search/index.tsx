import { useRef } from "react";
import Cytoscape from "cytoscape";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import cyConfig from "./cyConfig";
import styles from "./styles";

const Search = () => {
  const ref = useRef<any>(null);

  Cytoscape(cyConfig(ref.current));

  return (
    <Container sx={styles.container} maxWidth={false}>
      <Box sx={styles.searchFieldContainer}>
        <TextField label="Search" variant="outlined" />
        <Button variant="contained" disableElevation>
          Search
        </Button>
      </Box>

      <Box ref={ref} sx={styles.cy} />
    </Container>
  );
};

export default Search;
