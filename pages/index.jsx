
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
  // current  metamask address
  const [currentAddress, setCurrentAddress] = useState("");

  // the variable is used to invoke loader
  const [storeLoader, setStoreLoader] = useState(false)
  const [retrieveLoader, setRetrieveLoader] = useState(false)

  // Address of the receiver
  const [receiver, setReceiver] = useState("");
  // Address of account to fund
  const [accountToFund, setAccountToFund] = useState("");

  // Amount to fund address with
  const [amountToFund, setAmountToFund] = useState(0);
  const [serialNumber, setAccountSerialNumber] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [accountToGet, setAccountToGet] = useState("");


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
      getCurrentAddress()
    }
  }, [walletConnected]);


  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();

    const web3Provider = new ethers.BrowserProvider(provider);
    setProvider(web3Provider)

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

  // Get the current address of a
  const getCurrentAddress = async () => {
    const signer = await getProviderOrSigner(true);
    setCurrentAddress(signer.address);
  }

  /**
* Get address of an account
*  
*/
  async function getAddress() {


    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigneer = smartContract.connect(signer);

      const txn = await contractWithSigneer.getTheAddress(currentAddress, serialNumber);
      console.log("Signer is ", provider)
      console.log("Serial no ", serialNumber)
      console.log("Address gotten is", txn)

      setStoreLoader(false)

      alert(`The address is ${txn}`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }


  /**
* Create an account
*  
*/
  async function createWallet() {
    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      const createAccount = await contractWithSigner.createAccount(currentAddress, serialNumber);
      // console.log(createAccount)
      const response = await createAccount.wait()
      console.log(response.to)
      setStoreLoader(false)

      alert("Account created. Click 'Get account' to get the address")
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

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      const fundWallet = await contractWithSigner.fundWallet(accountToFund, { value: ethers.parseEther(amountToFund) });
      // console.log(fundWallet)
      const response = await fundWallet.wait()
      //console.log(response)
      setStoreLoader(false)

      alert(`Wallet funded with ${amountToFund} `)
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
      // interact with the methods in smart contract
      const getBalance = await contractWithSigner.balanceOf(accountToGet);

      setCurrentBalance(ethers.formatEther(getBalance))
      setRetrieveLoader(false)
      return
    } catch (error) {
      alert(error)
      console.log(error)
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
      <h4 className="mt-5"> {accountToGet ? accountToGet : "Your "} current balance is <span className='font-bold'>{currentBalance ? currentBalance : 0}</span> </h4>

      <input onChange={(e) => {
        setAccountToGet(e.target.value);
      }}
        name={'name'} required maxLength={"100"}
        type='text'
        step={1}
        className={"px-6 border-y-4 border-x-4 border-x-orange-600 py-3 mb-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-30"}
        placeholder="Address"
      />
      <button className='px-4 py-1 mb-5 rounded-2xl bg-slate-300 hover:bg-slate-500 flex justify-around transition-all w-32' onClick={() => getBalance(provider)}> {retrieveLoader ? (
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
      <div className="border-y-4 border-x-4 border-x-orange-600">
        <form onSubmit={handleOnFormSubmit} className={"m-3"}>
          <div className=" flex flex-col space-y-3">

            <input onChange={(e) => {
              setAccountSerialNumber(e.target.value);
            }}
              name={'name'} required maxLength={"10"}
              type='number'
              step={1}
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-30"}
              placeholder="Serial No e.g 0, 1, 2 etc"
            />
          </div>
        </form>

        <div className="flex flex-row align-middle items-center">
        </div>
      </div>
      <button onClick={createWallet} className='rounded-2xl mt-3 mb-5 px-4 py-1 bg-slate-300 flex justify-around hover:bg-slate-500 transition-all w-32'> {storeLoader ? (
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

      {/* Get Address */}
      <div className="border-y-4 border-x-4 border-x-orange-600">
        <form onSubmit={handleOnFormSubmit} className={"m-3"}>
          <div className=" flex flex-col space-y-3">

            <input onChange={(e) => {
              setAccountSerialNumber(e.target.value);
            }}
              name={'name'} required maxLength={"10"}
              type='number'
              step={1}
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-30"}
              placeholder="Serial No e.g 0, 1, 2 etc"
            />
          </div>
        </form>

        <div className="flex flex-row align-middle items-center">
        </div>
      </div>

      <button onClick={getAddress} className='rounded-2xl mt-3 px-4 py-1 bg-slate-300 flex justify-around hover:bg-orange-500 transition-all w-32'> {storeLoader ? (
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
      ) : "Get address"} </button>

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
              placeholder="Amount in ETH"
            />

            <input onChange={(e) => {
              setAccountToFund(e.target.value);
            }}
              name={'account'} required maxLength={"100"}
              type='text'
              className={"px-6 py-3 align-middle bg-slate-600 text-white rounded-lg border-solid outline-double	w-30"}
              placeholder="Address to fund"
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
      ) : "Fund account"} </button>
      <hr className="mb-5"></hr>


      <hr className="mb-5"></hr>
    </main>
  )
}
