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

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [graphElement, setGraphElement] = useState<any>([]);
  const [claims, setClaims] = useState<any>([]);
  const [cy, setCy] = useState<any>(null);
  const [searchVal, setSearchVal] = useState("");

  const fetchClaims = async (query: string) => {
    if (query.trim() !== "") {
      setLoading(true);
      try {
        const res = await axios.get(`/api/claim?page=1&limit=5`, {
          params: { search: query },
        });

        if (res.data.claims.length > 0) {
          const parsedClaims = parseClaims(res.data.claims);
          setGraphElement(
            Array.from(new Set([...graphElement, ...parsedClaims]))
          );
          setClaims(Array.from(new Set([...claims, ...res.data.claims])));
        } else {
          setSnackbarMessage("No results found");
          toggleSnackbar(true);
        }
      } catch (err: any) {
        toggleSnackbar(true);
        setSnackbarMessage(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchKeypress = async (event: any) => {
    if (event.key === "Enter" && searchVal.trim() !== "") {
      await fetchClaims(searchVal);
    }
  };

  useEffect(() => {
    if (graphElement.length > 0) {
      setCy(Cytoscape(cyConfig(ref.current, graphElement)));
    }
  }, [ref.current, graphElement]);

  useMemo(() => {
    if (cy) {
      // event listner for when a node is clicked
      cy.on("tap", "edge", (event: any) => {
        event.preventDefault();
        var claim = event.target;

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
        var claim = event.target;
        fetchClaims(claim.id());
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
        <Button
          variant="contained"
          onClick={() => fetchClaims(searchVal)}
          disableElevation
        >
          Search
        </Button>
      </Box>

      <Box ref={ref} sx={styles.cy} />
    </Container>
  );
};

export default Search;
