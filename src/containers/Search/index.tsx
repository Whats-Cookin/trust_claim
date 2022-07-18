import { useState, useRef, useMemo } from "react";
import Cytoscape from "cytoscape";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import Modal from "../../components/Modal";

import allClaims from "./output.json";
import cyConfig from "./cyConfig";
import styles from "./styles";

const Search = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const ref = useRef<any>(null);

  const cy = useMemo(() => {
    return Cytoscape(cyConfig(ref.current));
  }, [ref.current]);

  useMemo(() => {
    // event listner for when a node is clicked
    cy.on("tap", "node", function (e) {
      e.preventDefault();
      var node = e.target;

      //getting the claim data for selected node
      const currentClaim = allClaims.find(
        (claim) => claim.id === parseInt(node.id(), 10)
      );

      if (currentClaim) {
        setSelectedNode(currentClaim);
        setOpenModal(true);
      }
    });

    // add hover state pointer cursor on node
    cy.on("mouseover", "node", (event) => {
      const container = event?.cy?.container();
      if (container) {
        container.style.cursor = "pointer";
      }
    });

    cy.on("mouseout", "node", (event) => {
      const container = event?.cy?.container();
      if (container) {
        container.style.cursor = "default";
      }
    });
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
