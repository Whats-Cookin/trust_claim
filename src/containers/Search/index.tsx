import { useState, useRef, useMemo, useEffect } from "react";
import Cytoscape from "cytoscape";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import Modal from "../../components/Modal";
import dbClaims from "./mockData/dbClaims";
import cyConfig from "./cyConfig";
import styles from "./styles";

const Search = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [cy, setCy] = useState<any>(null);
  const ref = useRef<any>(null);

  const graphElements = useMemo(() => {
    const elements: any = [];

    dbClaims.forEach((claim) => {
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

    return elements;
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (!cy) setCy(Cytoscape(cyConfig(ref.current, graphElements)));
  }, [ref.current]);

  useMemo(() => {
    if (cy) {
      // event listner for when a node is clicked
      cy.on("tap", "edge", (event: any) => {
        event.preventDefault();
        var claim = event.target;

        //getting the claim data for selected node
        const currentClaim = dbClaims.find(
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
