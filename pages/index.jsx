
import { ethers } from "ethers";
// A single Web3 / Ethereum provider solution for all Wallets
import Web3Modal from "web3modal";
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  // application binary interface is something that defines structure of smart contract deployed.
  const abi = process.env.ABI

  // hooks for required variables
  const [provider, setProvider] = useState();

  const web3ModalRef = useRef();
  // Check if wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // the variable is used to invoke loader
  const [storeLoader, setStoreLoader] = useState(false)
  const [retrieveLoader, setRetrieveLoader] = useState(false)

  // Address of the receiver
  const [receiver, setReceiver] = useState("");
  // Amount to send
  const [amountToSend, setAmountToSend] = useState(0);
  const [amountToFund, setAmountToFund] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);


  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getBalance();
    }
  }, [walletConnected]);


  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();

    const web3Provider = new ethers.BrowserProvider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId.toString() !== '11155111') {
      console.log(chainId.toString())
      window.alert("Change the network to Sepolia");
      throw new Error("Change network to Sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
        connectWallet: Connects the MetaMask wallet
      */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };



  /**
* Send money to someone
*  
*/
  async function sendMoney() {
    // Validate input
    if (receiver.length < 1) {
      alert("Please enter a valid address")
      return
    }
    console.log(Number(ethers.parseEther(amountToSend)))

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);
      console.log(amountToSend)

      const writeNumTX = await contractWithSigner.transfer(receiver, ethers.parseEther(amountToSend));
      console.log(writeNumTX)
      const response = await writeNumTX.wait()
      console.log(await response)
      setStoreLoader(false)

      alert(`${amountToSend} Eth sent to ${receiver}`)
      return

    } catch (error) {
      alert(error)
      console.log(error)
      setStoreLoader(false)
      return
    }
  }


  /**
* Create a Wallet
*  
*/
  async function createWallet() {

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      const writeNumTX = await contractWithSigner.createWallet();
      console.log(writeNumTX)
      const response = await writeNumTX.wait()
      console.log(await response)
      setStoreLoader(false)

      alert(`Wallet created having your address`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }


  /**
* Fund wallet
*  
*/
  async function fundWallet() {

    console.log(ethers.parseEther(amountToFund))
    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      const writeNumTX = await contractWithSigner.fundWallet({ value: ethers.parseEther(amountToFund) });
      console.log(writeNumTX)
      const response = await writeNumTX.wait()
      console.log(await response)
      setStoreLoader(false)

      alert(`Wallet funded with ${amountToFund} ETH`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }

  /**
   * Get balance
  */
  async function getBalance(provider) {

    try {
      setRetrieveLoader(true)
      const signer = await getProviderOrSigner(true);

      // initalize smartcontract with the essentials detials.
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      console.log(contractAddress)
      // interact with the methods in smart contract
      const responsee = await contractWithSigner.balanceOf();

      console.log(parseInt(responsee))
      setCurrentBalance(ethers.formatEther(responsee))
      setRetrieveLoader(false)
      return
    } catch (error) {
      alert(error)
      setRetrieveLoader(false)
      return
    }
  }


  function handleOnFormSubmit(e) {
    e.preventDefault()
  }

  return (

    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-row bg-white rounded-lg shadow-md ">
        <div>
          <div className="text-2xl font-bold">Your Smart Wallet</div>
        </div>
      </div>
      <h4 className="mt-5">Your current balance is <span className='font-bold'>{currentBalance ? currentBalance : 0}</span> </h4>
      <button className='px-4 py-1 rounded-2xl bg-slate-300 hover:bg-slate-500 flex justify-around transition-all w-32' onClick={() => getBalance(provider)}> {retrieveLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "GET"} </button>
      <hr></hr>

      {/* Create wallet */}
      <button onClick={createWallet} className='rounded-2xl mt-3 px-4 py-1 bg-slate-300 flex justify-around hover:bg-slate-500 transition-all w-32'> {storeLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "Create a Wallet"} </button>
      <hr></hr>

      {/* Fund Wallet */}
      <div className="mt-4 border-y-4 border-x-4 border-x-blue-600">
        <form onSubmit={handleOnFormSubmit} className={"m-3"}>
          <div className=" flex flex-col space-y-3">

            <input onChange={(e) => {
              setAmountToFund(e.target.value);
            }}
              name={'name'} required maxLength={"10"}
              type='number'
              step={0.1}
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-30"}
              placeholder="Amount of ETH to fund wallet"
            />
          </div>
        </form>

        <div className="flex flex-row align-middle items-center">
        </div>
      </div>

      <button onClick={fundWallet} className='rounded-2xl mt-3 px-4 py-1 bg-slate-300 flex justify-around hover:bg-blue-500 transition-all w-32'> {storeLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "Fund Wallet"} </button>
      <hr className="mb-5"></hr>

      {/* Transfer to someone */}
      <div className="border-y-4 border-x-4 border-x-orange-600">
        <form onSubmit={handleOnFormSubmit} className={"m-3"}>
          <div className=" flex flex-col space-y-3">

            {/* receiver */}
            <input onChange={(e) => {
              setReceiver(e.target.value);
            }}
              name={'name'} required maxLength={"100"}
              type='text'
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-50"}
              placeholder="Address to send an Eth"
            />

            <input onChange={(e) => {
              setAmountToSend(e.target.value);
            }}
              name={'name'} required maxLength={"10"}
              type='number'
              step={0.1}
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-30"}
              placeholder="Amount of ETH to transfer"
            />
          </div>
        </form>

        <div className="flex flex-row align-middle items-center">
        </div>
      </div>

      <button onClick={sendMoney} className='rounded-2xl mt-3 px-4 py-1 bg-slate-300 flex justify-around hover:bg-orange-500 transition-all w-32'> {storeLoader ? (
        <svg
          className="animate-spin m-1 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75 text-gray-700"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : "Transfer"} </button>
      <hr className="mb-5"></hr>
    </main>
  )
}
