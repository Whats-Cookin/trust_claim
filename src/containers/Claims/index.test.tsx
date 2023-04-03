import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Home from "./index";
import { describe, expect, test } from 'vitest'


describe("Home", () => {

  // Redefine the functions 

  const removeTrailingSlash = (url: string) => {
    if (typeof url != 'string') {
        return url
    }
    return url
      .replace(/\/+$/, "")
      .replace("https://", "")
      .replace("http://", "");
  };

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



  describe("removeTrailingSlash", () => {
    
    it("removes trailing slash from URL", () => {
      const input = "https://example.com/";
      const expectedOutput = "example.com";
      expect(removeTrailingSlash(input)).toEqual(expectedOutput);
    });
  
    it("removes https:// from URL", () => {
      const input = "https://example.com";
      const expectedOutput = "example.com";
      expect(removeTrailingSlash(input)).toEqual(expectedOutput);
    });
  
    it("removes http:// from URL", () => {
      const input = "http://example.com";
      const expectedOutput = "example.com";
      expect(removeTrailingSlash(input)).toEqual(expectedOutput);
    });
  });
  

  describe("getTopicFromDomain", () => {

    test("should return the last segment of the URL if it includes 'trustclaims.whatscookin.us'", () => {
      const url = "https://trustclaims.whatscookin.us/foo/bar";
      const result = getTopicFromDomain(url);
      expect(result).toEqual("bar");
    });

    test("should remove the protocol and trailing slashes from the URL", () => {
      const url = "https://example.com/foo/bar/";
      const result = getTopicFromDomain(url);
      expect(result).toEqual("example.com/foo/bar");
    });
  });

  describe("Home component", () => {
    test("should render a 'Claims List' heading", () => {
      render(<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);
      const heading = screen.getByRole("heading", { name: "Claims List" });
      expect(heading).toBeInTheDocument();
    });

    test("should render fetched claims", () => {
      const fetchedClaims = [
        {
          id: 1,
          claim: "Example claim 1",
          createdAt: new Date().toISOString(),
          source: "https://example.com/foo",
          subject: "https://example.com/bar",
          statement: "Example statement 1",
        },
        {
          id: 2,
          claim: "Example claim 2",
          createdAt: new Date().toISOString(),
          source: "https://example.com/baz",
          subject: "https://example.com/qux",
          statement: "Example statement 2",
        },
      ];

      window.localStorage.setItem("claims", JSON.stringify(fetchedClaims));

      render(<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);

      fetchedClaims.forEach((claim) => {
        expect(screen.getByText(claim.claim)).toBeInTheDocument();
        expect(screen.getByText(claim.subject)).toBeInTheDocument();
        expect(screen.getByText(claim.statement)).toBeInTheDocument();
              
      });
    });
  });
});



