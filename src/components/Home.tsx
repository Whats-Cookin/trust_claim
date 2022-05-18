import React from "react";
import { EthereumAuthProvider, useViewerConnection } from "@self.id/framework";
import Form from "./Form";

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

  return (
    <>
      {isConnected && (
        <>
          <Form />
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
