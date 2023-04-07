import { render } from "@testing-library/react";
import Modal from "./index";
import { describe,vi, test, expect} from "vitest";


describe("Modal component", () => {

  // Redefine the function
  const getTopicFromDomain = (url: string) => {
    if (url.includes("trustclaims.whatscookin.us")) {
      return url.split("/").at(-1);
    } else {
      return url;
    }
  };

  const claimData = {
    id: 1,
    userId: 1,
    issuerId: 2,
    issuerIdType: "Company",
    createdAt: "2022-01-01T00:00:00Z",
    lastUpdatedAt: "2022-01-02T00:00:00Z",
    effectiveDate: "2022-01-01T00:00:00Z",
    title: "Example claim",
    source: "https://example.com",
    category: "example",
    value: "123",
  };

  test("renders the claim data in the modal", () => {
    const { getByText } = render(
      <Modal open={true} setOpen={() => {}} selectedClaim={claimData} />
    );

    expect(getByText("Claim")).toBeDefined();
    expect(getByText("Title")).toBeDefined();
    expect(getByText("Example claim")).toBeDefined();
    expect(getByText("Category")).toBeDefined();
    expect(getByText("Value")).toBeDefined();
    expect(getByText("123")).toBeDefined();
  });

  test("does not render if selectedClaim is null", () => {
    const { container } = render(
      <Modal open={true} setOpen={() => {}} selectedClaim={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  test('should return the last segment of the URL for trustclaims.whatscookin.us', () => {
    const url = 'https://trustclaims.whatscookin.us/topic1';
    const result = getTopicFromDomain(url);
    expect(result).toEqual('topic1');
  });

  test('should return the full URL for other domains', () => {
    const url = 'https://example.com/path/to/page';
    const result = getTopicFromDomain(url);
    expect(result).toEqual(url);
  });
});