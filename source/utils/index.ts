import { CeramicClient } from "@ceramicnetwork/http-client";

export const ceramic = new CeramicClient(
  `${process.env.REACT_APP_CERAMIC_URL}`
);
