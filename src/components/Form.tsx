import React, { useEffect, useState, useMemo } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { useViewerConnection } from "@self.id/framework";

export default function Form() {
  const ceramic = useMemo(
    () => new CeramicClient("https://ceramic-clay.3boxlabs.com"),
    []
  );
  const [connection] = useViewerConnection();

  useEffect(() => {
    if (connection.status === "connected") {
      const did = connection.selfID.did;
      did.authenticate().then(() => {
        ceramic.did = connection.selfID.did;
      });
    }
  }, [ceramic, connection]);

  const [source, setSource] = useState("");

  const handleSourceChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSource(e.currentTarget.value);
  };

  const handleSubmission = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    console.log("we do something");
    if (source) {
      const doc = await TileDocument.create(ceramic, { source });
      console.log("doc", doc);
    }
  };

  console.log("source", source);

  return (
    <form className="Form">
      <label htmlFor="objcet" className="Label">
        Object:
      </label>
      <br />
      <input
        id="object"
        type="text"
        value={source}
        onChange={handleSourceChange}
        className="Input"
      />
      <br />
      <br />
      <button
        className="Button"
        onClick={async (event) => await handleSubmission(event)}
      >
        Submit
      </button>
      <br />
      <br />
      <br />
    </form>
  );
}
