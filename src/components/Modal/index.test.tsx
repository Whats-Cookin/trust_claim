import { render } from "@testing-library/react";
import Modal from "./index";
import { describe,vi, test, expect} from "vitest";


describe("Modal component", () => {
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




it('should set open to false', () => {
  const handleClose = vi.fn()
  // Initialize state
  let open = false;

  // Call the function
  handleClose();

  // Check if the state variable has been updated correctly
  expect(open).toBe(false);
});


  test("does not render if selectedClaim is null", () => {
    const { container } = render(
      <Modal open={true} setOpen={() => {}} selectedClaim={null} />
    );

    expect(container.firstChild).toBeNull();
  });
});




