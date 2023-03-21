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
  
    it("returns input if it is not a string", () => {
      const input = 123;
      expect(removeTrailingSlash(input)).toEqual(input);
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

    test("should return the input if it is not a string", () => {
      const input = 123;
      const result = getTopicFromDomain(input);
      expect(result).toEqual(input);
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















// describe("Home component", () => {
//   test("renders claims list heading", () => {
//     render(<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);

//     const headingElement = screen.getByText(/Claims List/i);
//     expect(headingElement).toBeInTheDocument();
//   });


//   test("renders fetched claims", () => {
//     const fetchedClaims = [
//       {
//         id: 1,
//         claim: "Some claim",
//         createdAt: new Date().toISOString(),
//         source: "https://example.com",
//         subject: "https://example.com/subject",
//         statement: "Some statement",
//       },
//       {
//         id: 2,
//         claim: "Another claim",
//         createdAt: new Date().toISOString(),
//         source: "https://example.com/another",
//         subject: "https://example.com/subject",
//         statement: "Another statement",
//       },
//     ];
    
//     window.localStorage.setItem("claims", JSON.stringify(fetchedClaims));

//     render(<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);

//     fetchedClaims.forEach((claim) => {
//       expect(screen.getByText(claim.claim)).toBeInTheDocument();
//       expect(screen.getByText(claim.statement)).toBeInTheDocument();
      
//     });
//   });
// });





// import Home from "./index";
// import { render, screen } from "@testing-library/react";

// describe("Home component", () => {
//   test("renders claims list heading", () => {
//     render(<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);
    
//     const headingElement = screen.getByText(/Claims List/i);
//     expect(headingElement).toBeInTheDocument();
//   });

//   test("renders fetched claims", () => {
//     const mockClaims = [
//       {
//         id: 1,
//         claim: "Some claim",
//         createdAt: new Date().toISOString(),
//         source: "https://example.com",
//         subject: "https://example.com/subject",
//         statement: "Some statement",
//       },
//     ];

//     // Mock localStorage.getItem() to return the mock claims array
//     const getItemSpy = jest.spyOn(window.localStorage, "getItem").mockReturnValue(JSON.stringify(mockClaims));

//      render (<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);
//     const claimTypeElement = container.querySelector('div[aria-label="Claim Type"]');
//     expect(claimTypeElement).toBeTruthy();

//     const sourceLinkElement = container.querySelector('a[href="https://example.com"]');
//     expect(sourceLinkElement).toBeTruthy();

//     const subjectLinkElement = container.querySelector('a[href="https://example.com/subject"]');
//     expect(subjectLinkElement).toBeTruthy();

//     const statementElement = container.querySelector('div[aria-label="Statement"]');
//     expect(statementElement).toBeTruthy();

//     // Restore the original implementation of localStorage.getItem()
//     getItemSpy.mockRestore();
//   });
// });
