import { EthereumAuthProvider, useViewerConnection } from "@self.id/framework";
import { useEffect, useState } from "react";
import Form from "../Form";
import axios from "axios";

export default function Home() {
  const [connection, connect, disconnect] = useViewerConnection();

  let isConnected = connection.status === "connected";
  let showButton = isConnected || "ethereum" in window;

  const handleButtonClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      await connect(new EthereumAuthProvider(window.ethereum, accounts[0]));
    }
  };

  const [model, setModel] = useState<BackEndModel | any>(null);

  useEffect(() => {
    if (isConnected) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/model_aliases`)
        .then((response) => {
          console.log(response);
          setModel(response.data);
        });
    }
  }, [isConnected]);

  return (
    <>
      {isConnected && Boolean(model) && (
        <>
          <Form model={model} />
        </>
      )}
      {showButton && (
        <button className="Button" onClick={handleButtonClick}>
          {connection.status === "connected"
            ? `Disconnect (${connection.selfID.id})`
            : "Connect"}
        </button>
      )}
      {!showButton && (
        <p>
          An injected Ethereum provider such as{" "}
          <a href="https://metamask.io/">MetaMask</a> is needed to authenticate.
        </p>
      )}
    </>
  );
}
