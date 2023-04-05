import { render, fireEvent, waitFor, screen ,act} from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import  Login  from "./index";
import { describe, test, expect, beforeAll,afterAll,beforeEach,it, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { useNavigate, Link } from "react-router-dom";
import { Router } from "react-router-dom";


describe("Login component", () => {
    let mockAdapter = new MockAdapter(axios);
    // let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAdapter = new MockAdapter(axios);

  });

  afterEach(() => {
    mockAdapter.reset();

  });

  afterAll(() => {
    mockAdapter.restore();

  });

  it("should render the login form correctly", () => {
    const { getByLabelText, getByText } = render(<MemoryRouter><Login toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} /></MemoryRouter>);
    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Password")).toBeInTheDocument();
    expect(getByText("Login")).toBeInTheDocument();
  });
  it("should display an error message if login fails", async () => {
    mockAdapter.onPost("/login").reply(401, { error: "Invalid credentials" });
    const { getByLabelText, getByText ,queryByText } = render(<MemoryRouter><Login toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} /></MemoryRouter>);
    const emailInput = getByLabelText("Email") as HTMLInputElement;
    const passwordInput = getByLabelText("Password") as HTMLInputElement;
    const loginButton = getByText("Login");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.submit(loginButton);

    await act(async () => {
        await waitFor(() => {
          const errorMessage = queryByText("Invalid credentials");
          expect(errorMessage).toBe(null);
        });
      });
      
  });
  

  it("should navigate to the home page after successful login", async () => {
    mockAdapter.onPost("/login").reply(200, {
      accessToken: "valid-access-token",
      refreshToken: "valid-refresh-token",
    });
  
    const { getByLabelText, getByText } = render(<MemoryRouter><Login toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} /></MemoryRouter>);
  
    const emailInput = getByLabelText("Email") as HTMLInputElement;
    const passwordInput = getByLabelText("Password") as HTMLInputElement;
    const loginButton = getByText("Login");
  
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.submit(loginButton);
  
    expect(window.location.href).toEqual("http://localhost:3000/");

 
});
  });
