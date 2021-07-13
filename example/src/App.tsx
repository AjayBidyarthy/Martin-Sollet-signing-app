import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '../../';
import {
  clusterApiUrl,
} from '@solana/web3.js';


function toHex(buffer: Buffer) {
  return Array.prototype.map
    .call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function App(): React.ReactElement {
  const [logs, setLogs] = useState<string[]>([]);
  function addLog(log: string) {
    setLogs((logs) => [...logs, log]);
  }

  const [message, setMessage] = useState('');
  const [output, setOutput] = useState('');

  const network = clusterApiUrl('devnet');
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
  // const connection = useMemo(() => new Connection(network), [network]);
  const urlWallet = useMemo(
    () => new Wallet(providerUrl, network),
    [providerUrl, network],
  );
  // const injectedWallet = useMemo(() => {
  //   try {
  //     return new Wallet(
  //       (window as unknown as { solana: unknown }).solana,
  //       network,
  //     );
  //   } catch (e) {
  //     console.log(`Could not create injected wallet`, e);
  //     return null;
  //   }
  // }, [network]);
  const [selectedWallet, setSelectedWallet] = useState<
    Wallet | undefined | null
  >(undefined);
  const [, setConnected] = useState(false);
  useEffect(() => {
    if (selectedWallet) {
      selectedWallet.on('connect', () => {
        setConnected(true);
        setOutput(`Connected to wallet ${selectedWallet.publicKey?.toBase58() ?? '--'}`)
        addLog(
          `Connected to wallet ${selectedWallet.publicKey?.toBase58() ?? '--'}`,
        );
      });
      selectedWallet.on('disconnect', () => {
        setConnected(false);
        setOutput('Disconnected from wallet')
        addLog('Disconnected from wallet');
      });
      void selectedWallet.connect();
      return () => {
        void selectedWallet.disconnect();
      };
    }
  }, [selectedWallet]);

  // async function sendTransaction() {
  //   try {
  //     const pubkey = selectedWallet?.publicKey;
  //     if (!pubkey || !selectedWallet) {
  //       throw new Error('wallet not connected');
  //     }
  //     const transaction = new Transaction().add(
  //       SystemProgram.transfer({
  //         fromPubkey: pubkey,
  //         toPubkey: pubkey,
  //         lamports: 100,
  //       }),
  //     );
  //     addLog('Getting recent blockhash');
  //     transaction.recentBlockhash = (
  //       await connection.getRecentBlockhash()
  //     ).blockhash;
  //     addLog('Sending signature request to wallet');
  //     transaction.feePayer = pubkey;
  //     const signed = await selectedWallet.signTransaction(transaction);
  //     addLog('Got signature, submitting transaction');
  //     const signature = await connection.sendRawTransaction(signed.serialize());
  //     addLog('Submitted transaction ' + signature + ', awaiting confirmation');
  //     await connection.confirmTransaction(signature, 'singleGossip');
  //     addLog('Transaction ' + signature + ' confirmed');
  //   } catch (e) {
  //     console.warn(e);
  //     addLog(`Error: ${(e as Error).message}`);
  //   }
  // }

  async function signMessage() {
    try {
      if (!selectedWallet) {
        throw new Error('wallet not connected');
      }
      
      if(message){
        setOutput('Sending message signature request to wallet')
        addLog('Sending message signature request to wallet');
        const data = new TextEncoder().encode(message);
        const signed = await selectedWallet.sign(data, 'hex');
        setOutput('Got signature: ' + toHex(signed.signature))
        addLog('Got signature: \r\n' + toHex(signed.signature));
      }
      else
        setOutput('Please Enter Your Message to Sign.')
    } catch (e) {
      console.warn(e);
      setOutput(`Error: ${(e as Error).message}`)
      addLog(`Error: ${(e as Error).message}`);
    }
  }

  const boxStyle = {
    color: '#525252',
    border: '1px solid #6d6d6d',
    padding: '5px',
    margin: '5px 0',
    'border-radius': '6px',
    'line-break': 'anywhere',
    width: '100%',
    'box-sizing': 'border-box',
    'text-align': 'left'
  }

  const rows = {
    'margin-bottom': '20px',
    color: '#252525',
    'box-sizing': 'border-box',
    'text-align': 'center'
  }

  const buttonStyle = {
    'font-size': '20px',
    'padding': '5px',
    'margin': '0 10px',
  }

  logs
  return (
    <div className="App">
      <h1>Sign Message</h1>
      <div style={rows}>Network: {network}</div>
      <div style={rows}>
        Waller provider:{' '}
        <input
          style={boxStyle}
          type="text"
          disabled={selectedWallet && selectedWallet.connected ? true : false}
          value={providerUrl}
          onChange={(e) => setProviderUrl(e.target.value.trim())}
        />
      </div>
      
      {selectedWallet && selectedWallet.connected ? (
        <>
          <div style={rows}>
            Wallet address:
            <div style={boxStyle}>{selectedWallet.publicKey?.toBase58()}.</div>
          </div>
          <div style={rows}>
            Message:{' '}
            <textarea
              style={boxStyle}
              value={message}
              rows={5}
              placeholder={'Enter Your MEssage'}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div style={rows}>
            Output: 
            <div style={boxStyle}>
              {output}
            </div>
          </div>
          <div style={rows}>
            <button style={buttonStyle} onClick={signMessage}>Sign Message</button>
            <button style={buttonStyle} onClick={() => selectedWallet.disconnect()}>
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <div style={rows}>
          <button style={buttonStyle} onClick={() => setSelectedWallet(urlWallet)}>
            Connect to Wallet
          </button>
        </div>
      )}
      <hr />
    </div>
  );
}

export default App;
