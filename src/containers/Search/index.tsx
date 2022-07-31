import { useState, useRef, useMemo, useEffect } from "react";
import Cytoscape from "cytoscape";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import Modal from "../../components/Modal";

import claims from "./mockData/nodes.json";
import cyConfig from "./cyConfig";
import styles from "./styles";

const Search = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [cy, setCy] = useState<any>(null);

  const ref = useRef<any>(null);

  useEffect(() => {
    if (!cy) setCy(Cytoscape(cyConfig(ref.current)));
  }, [ref.current]);

  useMemo(() => {
    if (cy) {
      // event listner for when a node is clicked
      cy.on("tap", "node", (event: any) => {
        event.preventDefault();
        var node = event.target;

        // temp code to get the node id
        const locallySavedNodes = JSON.parse(
          localStorage.getItem("savedClaims") || "[]"
        );

        const nodes = [...claims, ...locallySavedNodes];

        //getting the claim data for selected node
        const currentClaim = nodes.find(
          (claim: any) => claim.data.id == node.id()
        );

        if (currentClaim) {
          setSelectedNode(currentClaim.data);
          setOpenModal(true);
        }
      });

      // add hover state pointer cursor on node
      cy.on("mouseover", "node", (event: any) => {
        const container = event?.cy?.container();
        if (container) {
          container.style.cursor = "pointer";
        }
      });

      cy.on("mouseout", "node", (event: any) => {
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
