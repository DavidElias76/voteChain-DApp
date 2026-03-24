import { createContext, useContext, useState, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const { updateUser } = useAuth();

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found. Please install MetaMask.");
      return null;
    }
    setConnecting(true);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);

      // Update wallet in backend
      try {
        await api.put("/auth/wallet", { wallet_address: address });
        updateUser({ wallet_address: address });
        toast.success("Wallet connected successfully!");
      } catch (err) {
        console.error("Failed to update wallet in backend:", err);
      }

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setSigner(null);
        } else {
          setAccount(accounts[0]);
        }
      });

      return { provider: web3Provider, signer: web3Signer, account: address };
    } catch (err) {
      toast.error(err.message || "Failed to connect wallet");
      return null;
    } finally {
      setConnecting(false);
    }
  }, [updateUser]);

  const getContract = useCallback((abi, address) => {
    if (!signer) return null;
    return new ethers.Contract(address, abi, signer);
  }, [signer]);

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  return (
    <WalletContext.Provider value={{ account, provider, signer, connecting, connectWallet, disconnect, getContract }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
