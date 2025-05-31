import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./NKNguyenTokenABI.json";
import { NKNGUYEN_TOKEN_ADDRESS } from "./config";

function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const [tokenBalance, setTokenBalance] = useState();
  const [ethBalance, setEthBalance] = useState();
  const [tokenPrice, setTokenPrice] = useState();
  const [amount, setAmount] = useState("1");

  const loadBlockchainData = async (_account) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const account = _account || await signer.getAddress();
    const contract = new ethers.Contract(NKNGUYEN_TOKEN_ADDRESS, abi, signer);

    setProvider(provider);
    setSigner(signer);
    setAccount(account);
    setContract(contract);

    const tBalance = await contract.balanceOf(account);
    const eBalance = await provider.getBalance(account);
    const price = await contract.tokenPrice();

    setTokenBalance(ethers.formatEther(tBalance));
    setEthBalance(ethers.formatEther(eBalance));
    setTokenPrice(ethers.formatEther(price));
  };

  useEffect(() => {
    if (window.ethereum) {
      loadBlockchainData();
      // Khi đổi account, reload lại
      window.ethereum.on("accountsChanged", (accounts) => {
        loadBlockchainData(accounts[0]);
      });
      // Khi đổi network, reload lại trang
      window.ethereum.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    }
    // Cleanup để tránh leak listener khi component unmount
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", loadBlockchainData);
        window.ethereum.removeListener("chainChanged", () => window.location.reload());
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();
        const _contract = new ethers.Contract(NKNGUYEN_TOKEN_ADDRESS, abi, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setContract(_contract);

        // Load balances
        const tBalance = await _contract.balanceOf(_account);
        const eBalance = await _provider.getBalance(_account);
        const price = await _contract.tokenPrice();

        setTokenBalance(ethers.formatEther(tBalance));
        setEthBalance(ethers.formatEther(eBalance));
        setTokenPrice(ethers.formatEther(price));
      }
    };
    init();
  }, []);

  const refresh = async () => {
    if (contract && account && provider) {
      const tBalance = await contract.balanceOf(account);
      const eBalance = await provider.getBalance(account);
      const price = await contract.tokenPrice();

      setTokenBalance(ethers.formatEther(tBalance));
      setEthBalance(ethers.formatEther(eBalance));
      setTokenPrice(ethers.formatEther(price));
    }
  };

  // Mua token (gửi ETH)
  const buyTokens = async () => {
    const value = ethers.parseEther((amount * tokenPrice).toString());
    const tx = await contract.buyTokens({ value });
    await tx.wait();
    refresh();
  };

  // Bán token (nhận ETH)
  const sellTokens = async () => {
    const tokenAmount = ethers.parseEther(amount.toString());
    const tx = await contract.sellTokens(tokenAmount);
    await tx.wait();
    refresh();
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20, border: "1px solid #eee", borderRadius: 12 }}>
      <h2>NKNguyenToken Frontend</h2>
      <p><strong>Account:</strong> {account}</p>
      <p><strong>ETH Balance:</strong> {ethBalance}</p>
      <p><strong>Token Balance:</strong> {tokenBalance} NKN</p>
      <p><strong>Current Price:</strong> {tokenPrice} ETH / NKN</p>
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={buyTokens} style={{ margin: "8px" }}>Buy</button>
      <button onClick={sellTokens}>Sell</button>
      <button onClick={refresh} style={{ marginLeft: "8px" }}>Refresh</button>
    </div>
  );
}

export default App;
