import { useState, useRef, useMemo, useEffect } from "react";
import Cytoscape from "cytoscape";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import axios from "../../axiosInstance";
import Modal from "../../components/Modal";
import cyConfig from "./cyConfig";
import styles from "./styles";
import IHomeProps from "./types";

const Search = (homeProps: IHomeProps) => {
  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps;

  const ref = useRef<any>(null);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchVal, setSearchVal] = useState(
    "http://trustclaims.whatscookin.us/local/company/VEJA"
  );
  const [fetchedClaims, setFetchedClaims] = useState<any>([]);
  const [graphElements, setGraphElements] = useState<any>([]);

  const [cy, setCy] = useState<any>(null);

  useMemo(() => {
    if (fetchedClaims) {
      const elements: any = [];
      fetchedClaims.forEach((claim: any) => {
        // adding subject node
        if (claim.subject) {
          const uri = new URL(claim.subject);
          elements.push({
            data: {
              id: claim.subject,
              label: `Host:\n${uri.origin}\n\n Path:\n${uri.pathname}`,
            },
          });
        }
        // adding object node
        if (claim.object) {
          const uri = new URL(claim.object);
          elements.push({
            data: {
              id: claim.object,
              label: `Host:\n${uri.origin}\n\n Path:\n${uri.pathname}`,
            },
          });
        }
        // adding edge between subject and object
        if (claim.subject && claim.object)
          elements.push({
            data: {
              id: claim.id,
              source: claim.subject,
              target: claim.object,
              relation: claim.claim,
            },
          });
      });
      setGraphElements(elements);
    }
  }, [fetchedClaims]);

  const fetchClaims = async () => {
    if (searchVal.trim() !== "") {
      setLoading(true);
      try {
        const res = await axios.get(`/api/claim`, {
          params: { search: searchVal },
        });
        if (res.data.length === 0) {
          setSnackbarMessage("No results found");
          toggleSnackbar(true);
        } else if (res.data.length > 0) {
          setFetchedClaims(res.data);
        }
      } catch (err: any) {
        toggleSnackbar(true);
        setSnackbarMessage(err.message);
      } finally {
        // setSearchVal("");
        setLoading(false);
      }
    }
  };

  const handleSearchKeypress = async (event: any) => {
    if (event.key === "Enter" && searchVal.trim() !== "") {
      await fetchClaims();
    }
  };

  useEffect(() => {
    if (!cy && graphElements.length > 0) {
      // @ts-ignore
      setCy(Cytoscape(cyConfig(ref.current, graphElements)));
    }
  }, [ref.current, graphElements]);

  useMemo(() => {
    if (cy) {
      // event listner for when a node is clicked
      cy.on("tap", "edge", (event: any) => {
        event.preventDefault();
        var claim = event.target;

        //getting the claim data for selected node
        const currentClaim = fetchedClaims.find(
          (c: any) => String(c.id) === claim.id()
        );

        if (currentClaim) {
          setSelectedNode(currentClaim);
          setOpenModal(true);
        }
      });

      // add hover state pointer cursor on node
      cy.on("mouseover", "edge", (event: any) => {
        const container = event?.cy?.container();
        if (container) {
          container.style.cursor = "pointer";
        }
      });

      cy.on("mouseout", "edge", (event: any) => {
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
        selectedNode={selectedNode}
      />
      <Box sx={styles.searchFieldContainer}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyUp={handleSearchKeypress}
        />
        <Button variant="contained" onClick={fetchClaims} disableElevation>
          Search
        </Button>
      </Box>

      <Box ref={ref} sx={styles.cy} />
    </Container>
  );
};

export default Search;
