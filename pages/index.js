import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [redeemItem, setRedeemItem] = useState('');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      let tx = await atm.deposit(ethers.utils.parseUnits(depositAmount, 'ether'), {
        value: ethers.utils.parseUnits(depositAmount, 'ether')
      });
      await tx.wait();
      getBalance();
      setDepositAmount('');
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      let tx = await atm.withdraw(ethers.utils.parseUnits(withdrawAmount, 'ether'));
      await tx.wait();
      getBalance();
      setWithdrawAmount('');
    }
  };

  const transfer = async () => {
    if (atm && recipient && transferAmount) {
      let tx = await atm.transfer(recipient, ethers.utils.parseUnits(transferAmount, 'ether'));
      await tx.wait();
      getBalance();
      setRecipient('');
      setTransferAmount('');
    }
  };

  const redeem = async () => {
    if (atm && redeemItem) {
      let tx = await atm.redeem(redeemItem);
      await tx.wait();
      getBalance();
      setRedeemItem('');
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <div>
          <h3>Deposit Funds</h3>
          <input 
            type="text" 
            placeholder="Amount in ETH" 
            value={depositAmount} 
            onChange={(e) => setDepositAmount(e.target.value)} 
          />
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <h3>Withdraw Funds</h3>
          <input 
            type="text" 
            placeholder="Amount in ETH" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)} 
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <div>
          <h3>Transfer Funds</h3>
          <input 
            type="text" 
            placeholder="Recipient Address" 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Amount in ETH" 
            value={transferAmount} 
            onChange={(e) => setTransferAmount(e.target.value)} 
          />
          <button onClick={transfer}>Transfer</button>
        </div>
        <div>
          <h3>Redeem Item</h3>
          <input 
            type="text" 
            placeholder="Item Name" 
            value={redeemItem} 
            onChange={(e) => setRedeemItem(e.target.value)} 
          />
          <button onClick={redeem}>Redeem</button>
        </div>
      </div>
    );
  };

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}
      </style>
    </main>
  );
}
