import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/react";

const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  position: absolute;
  left: calc(50% - 75px);
  top: calc(50% - 75px);
`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#F7E2E2");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      let chainId = await ethereum.request({ method: 'eth_chainId' });

      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      console.log("Connected", accounts[0]);
      console.log("Connected to chain " + chainId);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0x235E702E67d89505e2878bA87D67976c0CC7d1EE";
    setLoading(true);

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }  
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <ClipLoader color={color} loading={loading} css={override} size={150} />
      <div className="container">
        <div className="header-container">
          <p className="header">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;