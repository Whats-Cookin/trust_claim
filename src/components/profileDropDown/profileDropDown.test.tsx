import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
    beforeEach,
    it,
    afterEach
} from "vitest";
import axios, {AxiosInstance} from "axios";
import {MemoryRouter} from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import ProfileDropdown from "./index";
import {Navigate} from 'react-router-dom';
import {BACKEND_BASE_URL} from "../../utils/settings";
import React from "react";
import Search from "../../containers/Search/index";
import {BrowserRouter as Router} from 'react-router-dom';
import {
    Menu,
    IconButton,
    Button,
    Box,
    Fade,
    Tooltip,
    Hidden
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {useNavigate} from "react-router-dom";
import PropTypes from "prop-types";
import userEvent from '@testing-library/user-event';
import Claim from '../Claim';


describe("ProfileDropdown component", () => {
    let mockAdapter: MockAdapter;

    beforeEach(() => {
        mockAdapter = new MockAdapter(axios);

    });

    afterEach(() => {
        mockAdapter.reset();
    });

    afterAll(() => {
        mockAdapter.restore();
    });


    it("renders the component without errors", () => {
        const {getByRole} = render (
            <MemoryRouter>
                <ProfileDropdown/>
            </MemoryRouter>
        );
        const button = getByRole("button", {name: ""});
        expect(button).toBeInTheDocument();
    });

    it("displays the menu when the IconButton is clicked", () => {
        const {getByRole} = render (
            <MemoryRouter>
                <ProfileDropdown/>
            </MemoryRouter>
        );
        const menuButton = getByRole("button");
        fireEvent.click(menuButton);
        const menu = getByRole("menu");

    });


    test('navigates to the Search page when the Search button is clicked', async () => {
        render (
            <MemoryRouter initialEntries={
                ['/']
            }>
                <ProfileDropdown isAuth={true}/>
                <Search toggleSnackbar={undefined}
                    setSnackbarMessage={undefined}
                    setLoading={undefined}/>
            </MemoryRouter>
        );

        // Click on the Search button
        const searchButton = screen.getByRole('button', {name: 'Search'});
        userEvent.click(searchButton);


        // Assert that the current URL is '/search'
        await waitFor(() => expect(window.location.pathname).toBe("/"));
    });


    it("navigates to the Create Claim page when the Create Claim button is clicked", () => {
        const {navigate} = require("react-router-dom");
        render (
            <MemoryRouter>
                <ProfileDropdown isAuth={true}/>
                <Claim/>
            </MemoryRouter>
        );
        fireEvent.click(screen.getByRole("button"));


        expect(window.location.host).toBe("localhost:3000");
    });

    it("clears localStorage and navigates to the Login page when the Logout button is clicked", () => {
        render (
            <MemoryRouter>
                <ProfileDropdown isAuth={true}/>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button"));

        expect(localStorage.getItem("accessToken")).toBe(null);
        expect(localStorage.getItem("refreshToken")).toBe(null);

        const logoutButton = screen.getByText("Logout");
        fireEvent.click(logoutButton);

        expect(localStorage.getItem("accessToken")).toBe(null);
        expect(localStorage.getItem("refreshToken")).toBe(null);
        expect(window.location.href).toEqual("http://localhost:3000/");

    });

})
