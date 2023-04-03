import React from "react";
import { render, fireEvent } from "@testing-library/react";

import SearchWrapper from "./index";

describe("SearchWrapper", () => {
  it("renders a search input and search icon", () => {
    const { getByPlaceholderText, getByTestId } = render(<SearchWrapper onKeyUp={function (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        throw new Error("Function not implemented.");
    } } onChange={function (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        throw new Error("Function not implemented.");
    } } onSearchIconClick={function (): void {
        throw new Error("Function not implemented.");
    } } value={""} />);
    expect(getByPlaceholderText("Search for claims...")).toBeInTheDocument();
    expect(getByTestId("search-icon")).toBeInTheDocument();
  });

  it("calls onChange when user types in search input", () => {
    const onChangeMock = vi.fn();
    const { getByPlaceholderText } = render(<SearchWrapper onChange={onChangeMock} onKeyUp={function (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        throw new Error("Function not implemented.");
    } } onSearchIconClick={function (): void {
        throw new Error("Function not implemented.");
    } } value={""} />);
    const input = getByPlaceholderText("Search for claims...");
    fireEvent.change(input, { target: { value: "testing" } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it("calls onKeyUp when user presses a key in search input", () => {
    const onKeyUpMock = vi.fn();
    const { getByPlaceholderText } = render(<SearchWrapper onKeyUp={onKeyUpMock} onChange={function (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        throw new Error("Function not implemented.");
    } } onSearchIconClick={function (): void {
        throw new Error("Function not implemented.");
    } } value={""} />);
    const input = getByPlaceholderText("Search for claims...");
    fireEvent.keyUp(input, { key: "Enter", code: 13, charCode: 13 });
    expect(onKeyUpMock).toHaveBeenCalledTimes(1);
  });

  it("calls onSearchIconClick when user clicks the search icon", () => {
    const onSearchIconClickMock = vi.fn();
    const { getByTestId } = render(<SearchWrapper onSearchIconClick={onSearchIconClickMock} onKeyUp={function (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        throw new Error("Function not implemented.");
    } } onChange={function (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        throw new Error("Function not implemented.");
    } } value={""} />);
    const searchIcon = getByTestId("search-icon");
    fireEvent.click(searchIcon);
    expect(onSearchIconClickMock).toHaveBeenCalledTimes(1);
  });
});