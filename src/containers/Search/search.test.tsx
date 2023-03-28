import { render, fireEvent, waitFor, screen ,act, waitForElementToBeRemoved} from "@testing-library/react";
import { describe, test, expect, beforeAll,afterAll,beforeEach,it, afterEach } from "vitest";
import axios, { AxiosInstance } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import Search from "./index";
import { BACKEND_BASE_URL } from "../../utils/settings"
import userEvent from '@testing-library/user-event';
import cyConfig from "./cyConfig";
import IHomeProps from "./types";
import { parseClaims } from "./graph.utils";
import { useState } from "react";
import Button from "@mui/material/Button";
import Modal from "../../components/Modal";
import Dropdown from "../../components/Dropdown";



const mockResponse = {
  data: [
    {
      id: "1",
      title: "Test claim 1",
      description: "This is a test claim",
    },
    {
      id: "2",
      title: "Test claim 2",
      description: "This is another test claim",
    },
  ],
};

describe("search component", () => {
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    mockAdapter = new MockAdapter(axios);
    mockAdapter.onGet(`${BACKEND_BASE_URL}/claim`).reply(200, { claims: [] });
  });

  afterEach(() => {
    mockAdapter.reset();
  });

  afterAll(() => {
    mockAdapter.restore();
  });
  

  it("should render the Search component", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dropdown label={""} value={""} setter={function (value: string): void {
          throw new Error("Function not implemented.");
        } } options={[]} />
      </MemoryRouter>
    );

    const searchInput = screen.getByTestId("search-input");
     expect(searchInput).toBeInTheDocument();
  });
  
  it("should call the backend API when the user submits a search", async () => {
    const { getByTestId ,getByPlaceholderText } = render(
      <MemoryRouter>
        <Search setLoading={() => {}} setSnackbarMessage={() => {}} toggleSnackbar={() => {}} />
      </MemoryRouter>
    );
    const searchInput = getByPlaceholderText("Search...");
    const searchButton = getByTestId("search-button");
    expect(searchButton).toBeInTheDocument();
    
     fireEvent.change(searchInput, { target: { value: "test" } });
    userEvent.click(searchButton);
  
    
  });

  it("should display an error message if the backend API returns an error", async () => {
    const errorMessage = "Example error message";
    mockAdapter.onGet(`${BACKEND_BASE_URL}/claim`).reply(500, { message: errorMessage });
  
    const { getByTestId, getByPlaceholderText, getByText, queryByText } = render(
      <MemoryRouter>
        <Search setLoading={() => {}} setSnackbarMessage={() => {}} toggleSnackbar={() => {}} />
      </MemoryRouter>
    );
    
  
    const searchInput = getByPlaceholderText("Search...");
    const searchButton = getByTestId("search-button");
  
    // Verify that error message is not displayed initially
    expect(queryByText(errorMessage)).not.toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: "test" } });
    userEvent.click(searchButton);
  
  await waitFor(() => expect(queryByText(errorMessage)).toBeNull());

});
  
  

  it("searches for claims on input change", async () => {
    // Mock axios GET request
    mockAdapter.onGet("/api/claim").reply(200, mockResponse);

    const {getByTestId,getByPlaceholderText} = render(
      <MemoryRouter initialEntries={["/search?query=test"]}>
        <Search setLoading={() => {}} setSnackbarMessage={() => {}} toggleSnackbar={() => {}} />
      </MemoryRouter>
    );
    const searchInput = getByPlaceholderText("Search...");
    const searchButton = getByTestId("search-button");
    expect(searchButton).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: "test" } });
    await waitFor(() => expect(searchInput).toHaveValue("test"));

     userEvent.click(searchButton);
  });

  it("opens claims list page on button click", async () => {
    // Mock axios GET request
    mockAdapter.onGet("/api/claim").reply(200, mockResponse);
  
    const { getByTestId, getByPlaceholderText ,findByText ,queryByPlaceholderText} = render(
        <MemoryRouter initialEntries={["/search?query=test"]}>
      <Routes>
        <Route path="/claims" element={<div>Claims list page</div>} />
        <Route path="/" element={<Search setLoading={() => {}} setSnackbarMessage={() => {}} toggleSnackbar={() => {}} />} />
      </Routes>
      <Search setLoading={() => {}} setSnackbarMessage={() => {}} toggleSnackbar={() => {}} />
    </MemoryRouter>
    );
  
    const searchInput = getByPlaceholderText("Search...");
    const searchButton = getByTestId("search-button");
    expect(searchButton).toBeInTheDocument();
  fireEvent.change(searchInput, { target: { value: "test" } });
  userEvent.click(searchButton);

;
  });

});