import { useState, useRef, useMemo, useEffect } from "react";
import Cytoscape from "cytoscape";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import axios from "../../axiosInstance";
import Modal from "../../components/Modal";
import cyConfig from "./cyConfig";
import IHomeProps from "./types";
import { parseClaims } from "./graph.utils";
import styles from "./styles";

const Search = (homeProps: IHomeProps) => {
  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps;

  const ref = useRef<any>(null);
  let claims: any[] = [];

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [cy, setCy] = useState<any>(null);
  const [searchVal, setSearchVal] = useState("");

  const updateClaims = (search: boolean, newClaims: any) => {
    if (search) {
      const parsedClaims = parseClaims(newClaims);
      cy.elements().remove();
      cy.add(parsedClaims);
      claims = newClaims;
    } else {
      const parsedClaims = parseClaims(newClaims);
      cy.add(parsedClaims);
      claims = [...claims, ...newClaims];
    }
  };

  const fetchClaims = async (query: string, search: boolean) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/claim?page=1&limit=5`, {
        params: { search: query },
      });

      if (res.data.claims.length > 0) {
        updateClaims(search, res.data.claims);
      } else {
        setSnackbarMessage("No results found");
        toggleSnackbar(true);
      }
    } catch (err: any) {
      toggleSnackbar(true);
      setSnackbarMessage(err.message);
    } finally {
      setLoading(false);
      cy.layout({
        name: "breadthfirst",
        directed: true,
        padding: 10,
        animate: true,
        animationDuration: 500,
      }).run();
      cy.center();
    }
  };

  const handleSearch = async () => {
    if (searchVal.trim() !== "") await fetchClaims(searchVal, true);
  };

  const handleSearchKeypress = async (event: any) => {
    if (event.key === "Enter") handleSearch();
  };

  useMemo(() => {
    if (cy) {
      cy.on("tap", "edge", (event: any) => {
        event.preventDefault();
        const claim = event.target;
        //getting the claim data for selected node
        const currentClaim = claims.find(
          (c: any) => String(c.id) === claim.id()
        );

        if (currentClaim) {
          setSelectedClaim(currentClaim);
          setOpenModal(true);
        }
      });

      // handle node click to fetch further connected nodes
      cy.on("tap", "node", (event: any) => {
        event.preventDefault();
        const claim = event.target;
        fetchClaims(claim.id(), false);
      });

      // add hover state pointer cursor on node
      cy.on("mouseover", "edge,node", (event: any) => {
        const container = event?.cy?.container();
        if (container) {
          container.style.cursor = "pointer";
        }
      });

      cy.on("mouseout", "edge,node", (event: any) => {
        const container = event?.cy?.container();
        if (container) {
          container.style.cursor = "default";
        }
      });
    }
  }, [cy]);

  useEffect(() => {
    if (!cy) setCy(Cytoscape(cyConfig(ref.current)));
  }, []);

  return (
    <Container sx={styles.container} maxWidth={false}>
      <Modal
        open={openModal}
        setOpen={setOpenModal}
        selectedClaim={selectedClaim}
      />
      <Box sx={styles.searchFieldContainer}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyUp={handleSearchKeypress}
        />
        <Button variant="contained" onClick={handleSearch} disableElevation>
          Search
        </Button>
      </Box>

      <Box ref={ref} sx={styles.cy} />
    </Container>
  );
};

export default Search;
