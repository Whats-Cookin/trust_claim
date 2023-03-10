import { useState, useEffect } from "react";

import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IHomeProps from "./types";

const Home = (homeProps: IHomeProps) => {
  const [fetchedClaims, setFetchedClaims] = useState<any[]>([]);

  const getLocalClaims = async () => {
    const claims = JSON.parse(window.localStorage.getItem("claims") ?? "[]");
    setFetchedClaims(claims);
  };

  function removeTrailingSlash(url: string) {
    if (typeof url != 'string') {
        return url
    }
    return url
      .replace(/\/+$/, "")
      .replace("https://", "")
      .replace("http://", "");
  }

  const getTopicFromDomain = (url: string) => {
    if (typeof url != 'string') {
        return url
    }
    if (url.includes("trustclaims.whatscookin.us")) {
      return url.split("/").at(-1);
    } else {
      return removeTrailingSlash(url);
    }
  };

  useEffect(() => {
    getLocalClaims();
  }, []);

  return (
    <Box
      sx={{
        marginTop: 3,
      }}
    >
      <Typography variant="h3">Claims List</Typography>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          maxWidth: "700px",
          display: "flex",
          flexDirection: "column",
          rowGap: 1,
          margin: "30px auto",
        }}
      >
        {fetchedClaims.length > 0 &&
          fetchedClaims.map((claim) => (
            <Card
              key={claim.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 26px",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: 16,
                  backgroundColor: "grey.300",
                  px: 2,
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <p>
                  <strong>Type:</strong> {claim.claim}
                </p>
                <Typography sx={{ fontSize: 12 }}>
                  {new Date(claim.createdAt).toLocaleDateString("en-us", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 16, px: 3, py: 0.5 }}>
                <strong>Source:</strong>{" "}
                <a
                  href={`/search?query=${getTopicFromDomain(claim.source)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {claim.source}
                </a>
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 16, px: 3, py: 0.5 }}>
                <strong> Subject Name:</strong>{" "}
                <a
                  href={`/search?query=${getTopicFromDomain(claim.subject)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {claim.subject}
                </a>

                
              </Typography>
              

              <Typography
                variant="body1"
                sx={{
                  fontSize: 16,
                  px: 3,
                  py: 2,
                  borderTop: "1px #000 solid",
                }}
              >
                <strong>Statement:</strong> {claim.statement}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: 16,
                  px: 3,
                  py: 2,
                  borderTop: "1px #000 solid",
                }}
              >
                <strong>Source:</strong>{" "}
                <a href={claim.source}>{claim.source}</a>

                {/* <strong>subject Name:</strong>{" "}
                <a href={claim.subjectName}>{claim.subjectName}</a> */}

              </Typography>
            </Card>
          ))}
      </Box>
    </Box>
  );
};

export default Home;
