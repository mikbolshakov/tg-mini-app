import React from 'react';
import { ethers } from 'ethers';
import contractAbi from './ABI/contractAbi.json';
import './App.css';

function App() {
  const [metaMaskConnected, setMetaMaskConnected] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState('');

  const getContract = () => {
    try {
      const contractAddress = '0x518f69B4b3e93b1952ee7327977F4158BF938E64';
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer,
      );

      return contract;
    } catch (error) {
      console.log(error.message);
    }
  };

  const shortAddress = (address) => {
    return address ? address.substr(0, 6) + '...' + address.substr(-5) : '';
  };

  const disconnectWalletHandler = () => {
    if (window.ethereum) {
      try {
        if (typeof window.ethereum.disconnect === 'function') {
          window.ethereum.disconnect();
        }

        setMetaMaskConnected(false);
        setWalletAddress('');
      } catch (error) {
        console.log(error);
      }
    }
  };

  const connectMetamaskHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum
          .request({ method: 'eth_requestAccounts' })
          .then((res) => {
            return res;
          });

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }

        const currentChainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        if (currentChainId !== '0xE705') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xE705' }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0xE705',
                      chainName: 'Linea Sepolia test network',
                      rpcUrls: ['https://linea-sepolia.infura.io/v3/'],
                      nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18,
                      },
                      blockExplorerUrls: ['https://sepolia.lineascan.build'],
                    },
                  ],
                });
              } catch (addError) {
                console.log(addError);
                return;
              }
            } else {
              console.log(switchError);
              return;
            }
          }
        }

        setMetaMaskConnected(true);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('install metamask extension!!');
    }
  };

  async function mintHandler() {
    const contract = getContract();

    try {
      const tx = await contract.safeMint();
      await tx.wait();
      alert('Success!');
    } catch (error) {
      console.error('Minting error:', error.message);
      alert('Error!');
    }
  }

  return (
    <div className="container">
      {metaMaskConnected ? (
        <button className="connect-button" onClick={disconnectWalletHandler}>
          {shortAddress(walletAddress)}
        </button>
      ) : (
        <button className="connect-button" onClick={connectMetamaskHandler}>
          Connect MetaMask
        </button>
      )}
      <button className="mint-button" onClick={mintHandler}>
        Mint NFT
      </button>
    </div>
  );
}

export default App;
