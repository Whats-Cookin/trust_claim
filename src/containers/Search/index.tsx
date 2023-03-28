import { useState, useRef, useMemo, useEffect } from "react";
import Cytoscape from "cytoscape";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Typography } from "@mui/material";
import { BACKEND_BASE_URL } from "../../utils/settings";

const Search = (homeProps: IHomeProps) => {
  const search = useLocation().search;
  const navigate = useNavigate();

  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps;
  const ref = useRef<any>(null);
  let claims: any[] = [];
  const query = new URLSearchParams(search).get("query");
  const [tempClaims, setTempClaims] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [cy, setCy] = useState<any>(null);
  const [searchVal, setSearchVal] = useState<string>(query || "");
  const claimsPageMemo: any[] = [];

  const updateClaims = (search: boolean, newClaims: any) => {
    if (search) {
      const parsedClaims = parseClaims(newClaims);
      cy.elements().remove();
      cy.add(parsedClaims);
      claims = newClaims;
      setTempClaims(newClaims);
    } else {
      const parsedClaims = parseClaims(newClaims);
      cy.add(parsedClaims);
      claims = [...claims, ...newClaims];
      setTempClaims([...tempClaims, ...newClaims]);
    }
  };

  const fetchClaims = async (query: string, search: boolean, page: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/claim?page=${page}&limit=5`, {
        params: { search: query },
      });
  
      if (res.data.claims.length > 0) {
        updateClaims(search, res.data.claims);
        cy.layout({
          name: "circle",
          directed: true,
          padding: 30,
          animate: true,
          animationDuration: 1000,
        }).run();
        cy.center();
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
  };
  


  const openClaimsList = () => {
    window.localStorage.setItem("claims", JSON.stringify(tempClaims));
    navigate("/claims");
  };

  const handleSearch = async () => {
    window.localStorage.removeItem("claims");
    if (searchVal.trim() !== "") {
      navigate({
        pathname: "/search",
        search: `?query=${searchVal}`,
      });

      await fetchClaims(encodeURIComponent(searchVal), true, 1);
    }
  };


  
  const handleSearchKeypress = async (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const reset = () => {
    navigate("/search");
    setSearchVal("");
    cy.elements().remove();
    claims = [];
    setTempClaims([]);
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
      cy.on("tap", "node", async (event: any) => {
        event.preventDefault();
        const claim = event.target;
        const foundIndex = claimsPageMemo.findIndex(
          (item) => item.id == claim.id()
        );
        if (foundIndex === -1) {
          claimsPageMemo.push({ id: claim.id(), page: 1 });
          await fetchClaims(claim.id(), false, 1);
        } else {
          claimsPageMemo[foundIndex].page++;
          claimsPageMemo.push({
            id: claim.id(),
            page: claimsPageMemo[foundIndex].page,
          });
          await fetchClaims(claim.id(), false, claimsPageMemo[foundIndex].page);
        }
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
  }, [cy, claims]);

  useMemo(() => {
    if (cy && query) handleSearch();
  }, [cy]);


  useEffect(() => {
    if (!cy || !ref.current) return;
  
    setCy(Cytoscape(cyConfig(ref.current)));
  }, [cyConfig, cy, ref]);
  
  return (
    <Container sx={styles.container} maxWidth={false}>
      
      <Modal
        open={openModal}
        setOpen={setOpenModal}
        selectedClaim={selectedClaim}
      />
      <Box sx={styles.searchFieldContainer}>
        <TextField
           id="search-input"
           type="text"
           data-testid="search-input"
           placeholder="Search..."
           value={searchVal}
          variant="outlined"
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyUp={handleSearchKeypress}
          sx={{
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#000",
            },
          }}
        />
        <Button
          variant="contained"
          data-testid="search-button"
          onClick={handleSearch}
          sx={{
            backgroundColor: "#333333",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#333333",
              color: "#fff",
            },
          }}
          disableElevation
        >
          Search
        </Button>
        <Button
          variant="outlined"
          onClick={reset}
          sx={{
            backgroundColor: "#fff",
            color: "#333333",
            fontWeight: "bold",
            border: "2px solid #333333",
            "&:hover": {
              backgroundColor: "#fff",
              border: "2px solid #333333",
              color: "#333333",
            },
          }}
          disableElevation
        >
          Reset
        </Button>
      </Box>
      {tempClaims.length > 0 && (
        <Button
          variant="outlined"
          onClick={openClaimsList}
          sx={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 100,
            backgroundColor: "#fff",
            color: "#333333",
            fontWeight: "bold",
            border: "2px solid #333333",
            "&:hover": {
              backgroundColor: "#fff",
              border: "2px solid #333333",
              color: "#333333",
            },
          }}
          disableElevation
        >
          View Claims in List
        </Button>
      )}
      <Box ref={ref} sx={styles.cy} />
    </Container>
  );
};

export default Search;
