
import MockAdapter from "axios-mock-adapter";
import Home from './index';
import { describe, test, expect, beforeAll,beforeEach,it, afterEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import axios from 'axios';
import { queryByTestId ,getByTestId} from '@testing-library/dom';

import React from "react";
import { MemoryRouter } from "react-router-dom";

describe('Home component', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.restore();
  });
  it("should render correctly", () => {
    const { container } = render(
      <MemoryRouter> // wrap Home with MemoryRouter
        <Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
  it('should fetch claims on search icon click', async () => {
    const { getByLabelText } = render(
        <MemoryRouter> // wrap Home with MemoryRouter
          <Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />
        </MemoryRouter>
      );
    const response = { data: [{ id: 1, name: 'claim 1' }] };
    mockAxios.onGet('/api/claims').reply(200, response);

    const searchIcon = getByLabelText("search");
fireEvent.click(searchIcon);

  });
});


