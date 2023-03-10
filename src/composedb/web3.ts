import Web3 from "web3";

const web3 = new Web3(window.ethereum);
await (window as any).ethereum.enable();

export default web3;
