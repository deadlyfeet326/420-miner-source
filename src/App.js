import React, {useContext, useState, useEffect} from 'react'
import logo from './components/unknown.png'
import jointRight from './components/jointright.gif'
import jointLeft from './components/jointleft.gif'
import copy from './components/copy.png'
import bsc from './components/bsc.png'
import tg from './components/tg.png'
import { ethers } from 'ethers'
import { v4 } from 'uuid';
import { NotificationContext } from './Notifications/NotificationProvider';
import { WebSocketProvider } from '@ethersproject/providers'

function App() {

  // let gameNetworkId = '0x38'
  let gameNetworkId = '0x61'

  const dispatch = useContext(NotificationContext)

  let gameAbi = '[{"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"buyEggs","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"ref","type":"address"},{"internalType":"bool","name":"isBuy","type":"bool"}],"name":"hatchEggs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"seedMarket","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"sellEggs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"beanRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"},{"internalType":"uint256","name":"contractBalance","type":"uint256"}],"name":"calculateEggBuy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"}],"name":"calculateEggBuySimple","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eggs","type":"uint256"}],"name":"calculateEggSell","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getEggsSinceLastHatch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMyEggs","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMyMiners","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]'
  let gameContractAddress = '0x099364719e295bF0669484880C94Db8d719b8D67'

  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [networkId, setNetworkId] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState(null)

  const[gameContract, setGameContract] = useState(null);
  
  const[contractBalance, setContractBalance] = useState(0)
  const[walletBalance, setWalletBalance] = useState(0)
  const[plantBalance, setPlantBalance] = useState(0)

  const[buyValue, setBuyValue] = useState(0)

  const[rewards, setRewards] = useState(0)
  const[connectText, setConnextText] = useState("Connect")
  const[referralLink, setReferralLink] = useState("http://420miner.com/?ref=")
  const [isMobile, setIsMobile] = useState(false)
  const [referralAddress, setReferralAddress] = useState('0x0000000000000000000000000000000000000000')
 
// //choose the screen size 
// const handleResize = () => {
//   if (window.innerWidth < 1000) {
//       setIsMobile(true)
//   } else {
//       setIsMobile(false)
//   }
// }

useEffect(() => {
  if (window.location.href.includes("http://420miner.com?ref=")){
    let referral = window.location.href.replace("http://420miner.com?ref=", '')
    setReferralAddress(referral)
  }else if (window.location.href.includes("http://420miner.com/?ref=")){
    let referral = window.location.href.replace("http://420miner.com/?ref=", '')
    setReferralAddress(referral)
  }
  
}, [])

useEffect(() => {
  if(window.ethereum){
    console.log(window.ethereum.networkVersion)
    if (window.ethereum.networkVersion !== gameNetworkId){
      console.log("wrong chain")
      setConnextText("Switch Chain")
    }
  }
  window.ethereum.on("chainChanged", networkChanged)
  window.ethereum.on("accountsChanged", accountChanged)

  return () => {
      window.ethereum.removeListener("chainChanged", networkChanged)
      window.ethereum.removeListener("accountsChanged", accountChanged)
  }
}, [])

// useEffect(() => {
//   if (window.location.href.includes('/?')){
//     window.location = window.location.href.replace('/?', '?')
//   }
// })

// create an event listener
useEffect(() => {
  if (window.innerWidth < 1000){
    setIsMobile(true)
  }
  // window.addEventListener("resize", handleResize)
})

useEffect(() => {
  getWalletBalance()
}, [provider])

useEffect(() => {
  getBalances()
}, [gameContract])

function networkChanged(chainId){
  if (chainId !== gameNetworkId){
      console.log("wrong chain")
      setConnextText("Switch Chain")
  }
}

const connectWalletHandler = async () => {
  if (window.ethereum) {
      if (connectText == "Switch Chain"){
        try{
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: gameNetworkId }], // chainId must be in hexadecimal numbers
          });
        }catch{
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: gameNetworkId, chainName: "BSC Testnet", nativeCurrency: {
              name: "BNB", symbol: "BNB", decimals: 18
            }, rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"], blockExplorerUrls: ["https://explorer.binance.org/smart-testnet"] }], // chainId must be in hexadecimal numbers
          });
        }
      }
      let result = await window.ethereum.request({method: 'eth_requestAccounts'})
      accountChangedHandler(result[0])
      setNetworkId()
  } else {
      setErrorMessage("Need to install Metamask!")
  }
}

function accountChanged(accountList) {
  accountChangedHandler(accountList[0])
}

const accountChangedHandler = (newAccount) => {
  let checksumAccount = ethers.utils.getAddress(newAccount)
  setDefaultAccount(checksumAccount);
  setReferralLink("http://420miner.com?ref=" + checksumAccount)
  setConnextText(checksumAccount.toString().substring(0, 5) + "..." + checksumAccount.toString().substring(checksumAccount.toString().length - 4, checksumAccount.toString().length - 1))
  updateEthers()
}

function updateEthers() {
  let tempProvider = new ethers.providers.Web3Provider(window.ethereum)
  setProvider(tempProvider)

  let tempSigner = tempProvider.getSigner();
  try{
      
      let tempContract = new ethers.Contract(gameContractAddress, gameAbi, tempSigner);
      setGameContract(tempContract);
  }catch{
      console.log("error")
  }
}

async function getWalletBalance() {
  let walBalance = await provider.getBalance(defaultAccount)
  setWalletBalance((walBalance / (10 ** 18)).toString().substring(0, (walBalance / (10 ** 18)).toString().indexOf('.') + 4))
}

async function getBalances(){
  let caBalance = await gameContract.getBalance()
  setContractBalance((caBalance / (10 ** 18)).toString().substring(0, (caBalance / (10 ** 18)).toString().indexOf('.') + 4))
  let minerBalance = await gameContract.getMyMiners(defaultAccount)
  setPlantBalance(minerBalance.toString())
  let nugs = await gameContract.beanRewards(defaultAccount)
  if ((Number(nugs.toString()) / (10 ** 18)) < 0.001){
    setRewards(Number(nugs.toString()) / (10 ** 18))
  }else{
    setRewards((nugs / (10 ** 18)).toString().substring(0, (nugs / (10 ** 18)).toString().indexOf('.') + 4))
  }
}

  function copyToClipboard(){
    navigator.clipboard.writeText(referralLink)
  }

  function openTg(){
    window.open("https://t.me/BSC420Miner")
  }

  function openBSC(){
    window.open("https://testnet.bscscan.com/address/0x099364719e295bF0669484880C94Db8d719b8D67")
  }

  async function buySeeds(){
    let buyAmount = ethers.utils.parseUnits(buyValue, 'ether')
    let tx = await gameContract.buyEggs(referralAddress, {value: buyAmount})
    let hash = tx.hash
        dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
                id: v4(),
                type: "NEUTRAL",
                message: "Transaction Sent",
                link : "https://testnet.bscscan.com/tx/" + hash
            }
        })
        tx.wait()
        .then((tx) => {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: v4(),
                    type: "SUCCESS",
                    message: "Minted Successfully",
                    link : "https://testnet.bscscan.com/tx/" + hash
                }
            })
            getBalances()
        }).catch((err) => {
            console.log(err)
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: v4(),
                    type: "ERROR",
                    message: "Minting Failed",
                    link : "https://testnet.bscscan.com/tx/" + hash
                }
            })
        })
  }

  async function harvestNugs(){
    let tx = await gameContract.sellEggs()
    let hash = tx.hash
        dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
                id: v4(),
                type: "NEUTRAL",
                message: "Transaction Sent",
                link : "https://testnet.bscscan.com/tx/" + hash
            }
        })
        tx.wait()
        .then((tx) => {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: v4(),
                    type: "SUCCESS",
                    message: "Minted Successfully",
                    link : "https://testnet.bscscan.com/tx/" + hash
                }
            })
            getBalances()
        }).catch((err) => {
            console.log(err)
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: v4(),
                    type: "ERROR",
                    message: "Minting Failed",
                    link : "https://testnet.bscscan.com/tx/" + hash
                }
            })
        })
  }
  
  async function plantSeeds(){
    let tx = await gameContract.hatchEggs(referralAddress, false)
    let hash = tx.hash
        dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
                id: v4(),
                type: "NEUTRAL",
                message: "Transaction Sent",
                link : "https://testnet.bscscan.com/tx/" + hash
            }
        })
        tx.wait()
        .then((tx) => {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: v4(),
                    type: "SUCCESS",
                    message: "Minted Successfully",
                    link : "https://testnet.bscscan.com/tx/" + hash
                }
            })
            getBalances()
        }).catch((err) => {
            console.log(err)
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: v4(),
                    type: "ERROR",
                    message: "Minting Failed",
                    link : "https://testnet.bscscan.com/tx/" + hash
                }
            })
        })
  }

  return (
    <div className="App">
      
      <div className="header"> 
        <img className='bsc' onClick={openBSC} src={bsc} alt="" />
        <img className='tg' onClick={openTg} src={tg} alt="" />
        <button className="connectButton" onClick={connectWalletHandler}> <b>{connectText}</b> </button> 
      </div>
      <div className='logoContainer'>
        <img className='logo' src={logo} alt="" />
      </div>
      <div className={isMobile ? 'mobileGrid' : 'grid'}>
        <div className='rightJoint1'> <img src={jointRight} alt="" /></div>
        <div className='leftJoint1'> <img src={jointLeft} alt="" /></div>
        <div className='rightJoint2'> <img src={jointRight} alt="" /></div>
        <div className='leftJoint2'> <img src={jointLeft} alt="" /></div>
        <div className={isMobile ? 'mobiledApp' : 'dApp'}>
          <div className='row'>
              <h3 className='left'> Contract Balance </h3>
              <h2 className='right'> {contractBalance} </h2>
          </div>
          <div className='row'>
              <h3 className='left'> Wallet Balance </h3>
              <h2 className='right'> {walletBalance} </h2>
          </div>
          <div className='row'>
              <h3 className='left'> Plant Balance </h3>
              <h2 className='right'> {plantBalance} </h2>
          </div>
          <div className='textSection'>
              <input className='textbox' placeholder="0" type="text" onChange={(e) => setBuyValue(e.target.value)}></input>
              <h2 className='bnb'> BNB </h2>
          </div>
          <div className='buttonContainer'>
            <button className='buyButton' onClick={() => buySeeds()}> <b>Buy Seeds</b> </button>
          </div>
          <div className='rewards'>
            <h3 className='center'> <b>Your Nugs  :</b>  </h3>
            <h3> {rewards} </h3>
          </div>
          <div className='compoundClaim'>
          <button className='buyButton' onClick={plantSeeds}> <b>Plant Seeds</b></button>
          <button className='buyButton' onClick={harvestNugs}><b>Harvest Nugs</b></button>
          </div>

        </div>
        <div className={isMobile ? 'mobileStats' : 'stats'}>
            <h2 className='top'>STATS</h2>
          <div className='row'>
              <h3 className='left'> 12 Hour Return </h3>
              <h2 className='right'> 4.20% </h2>
          </div>
          <div className='row'>
              <h3 className='left'> Deposit Fee </h3>
              <h2 className='right'> 4.20% </h2>
          </div>
          <div className='center'>
              <h2 className='penalty'>🏆 BONUS 🏆</h2>
          </div>
          <div className='penaltyText'>
              <h3>Everytime You Compound...</h3><div className='line2'>
              <h3 style={{color: "rgba(153, 54, 145, 0.726)"}}> 4 &nbsp;</h3> <h3>% Bonus!!! </h3>
              </div>
              <div className='line2'>
                <h2 className='tax'> Up to &nbsp;</h2><h2 style={{color: "rgba(153, 54, 145, 0.726)"}}> 20 &nbsp;</h2> <h2> %</h2>
              </div>
              <p><i>24 hour delay between each bonus</i></p>
          </div>
        </div>
      </div>
      <div className='referral'>
          <h2 className='top'> Referral Link</h2>
          <div className='referralLink'>
            <b>{referralLink}</b><img className='copy' onClick={copyToClipboard} src={copy} alt="" />
          </div>
          <p><i> Earn 10% of the BNB used to plant seeds from anyone who uses your referral link! </i></p>
      </div>
      
    </div>
  );
}

export default App;
