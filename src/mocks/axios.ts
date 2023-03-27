// src/mocks/axios.ts

import { AxiosInstance } from "axios";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mockAxios: AxiosInstance = axios.create();
const mock = new MockAdapter(mockAxios);

  
export { mockAxios, mock, axios };
