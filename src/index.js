/*
    Developed / Developing by Cosmostation
    [WARNING] CosmosJS is under ACTIVE DEVELOPMENT and should be treated as alpha version. We will remove this warning when we have a release that is stable, secure, and propoerly tested.
*/
import 'isomorphic-fetch';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bech32 from 'bech32';
import secp256k1 from 'secp256k1';
import message from './messages/proto';
import CONSTANTS from './constants';
import { createHash } from 'crypto';

function trimBuffer(buf) {
  // remove 32,0 (space + null)
  if (buf.length > 2 && buf[buf.length - 2] === 32 && buf[buf.length - 1] === 0) {
    return buf.slice(0, buf.length - 2);
  }
  return buf;
}

const hash160 = (buffer) => {
  const sha256Hash = createHash('sha256').update(buffer).digest();
  try {
    return createHash('rmd160').update(sha256Hash).digest();
  } catch (err) {
    return createHash('ripemd160').update(sha256Hash).digest();
  }
};

export default class Cosmos {
  constructor(url, chainId, bech32MainPrefix = "orai", hdPath = "m/44'/118'/0'/0/0") {
    // strip / at end
    this.url = url.replace(/\/$/, '');
    this.chainId = chainId;
    this.path = hdPath;
    this.bech32MainPrefix = bech32MainPrefix;
  }

  setBech32MainPrefix(value) {
    this.bech32MainPrefix = value;
    if (!this.bech32MainPrefix) throw new Error('bech32MainPrefix object was not set or invalid');
  }

  generateMnemonic(strength) {
    return bip39.generateMnemonic(strength);
  }

  setPath(value) {
    this.path = value;
    if (!this.path) throw new Error('path object was not set or invalid');
  }

  getChildKey(mnemonic, checkSum = true) {
    if (typeof mnemonic !== 'string') {
      throw new Error('mnemonic expects a string');
    }

    if (checkSum) {
      if (!bip39.validateMnemonic(mnemonic)) throw new Error('mnemonic phrases have invalid checksums');
    }
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    return node.derivePath(this.path);
  }

  static getChildKeyStatic(mnemonic, path, checkSum = true) {
    if (typeof mnemonic !== 'string') {
      throw new Error('mnemonic expects a string');
    }

    if (checkSum) {
      if (!bip39.validateMnemonic(mnemonic)) throw new Error('mnemonic phrases have invalid checksums');
    }
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    return node.derivePath(path);
  }

  getAddress(childOrMnemonic, checkSum = true) {
    // compartible
    if (typeof childOrMnemonic === 'string') {
      return this.getAddress(this.getChildKey(childOrMnemonic, checkSum));
    }
    const words = bech32.toWords(childOrMnemonic.identifier);

    return bech32.encode(this.bech32MainPrefix, words);
  }

  getAddressFromPub(pubkey) {
    const words = bech32.toWords(hash160(pubkey));
    const address = bech32.encode(this.bech32MainPrefix, words);
    return address;
  };

  getAddressStr(operatorAddr) {
    const fullWords = bech32.decode(operatorAddr);
    if (fullWords.words) {
      return bech32.encode(this.bech32MainPrefix, fullWords.words);
    }
  }

  getValidatorAddress(childOrMnemonic, checkSum = true) {
    // compartible
    if (typeof childOrMnemonic === 'string') {
      return this.getValidatorAddress(this.getChildKey(childOrMnemonic, checkSum));
    }
    const words = bech32.toWords(childOrMnemonic.identifier);

    return bech32.encode(this.bech32MainPrefix + 'valoper', words);
  }

  getOperatorAddressStr(addr) {
    const fullWords = bech32.decode(addr);
    if (fullWords.words) {
      return bech32.encode(this.bech32MainPrefix + 'valoper', fullWords.words);
    }
  }

  get statusCode() {
    return CONSTANTS.STATUS_CODE;
  }

  getECPairPriv(childOrMnemonic, checkSum = true) {
    // compartible
    if (typeof childOrMnemonic === 'string') {
      return this.getECPairPriv(this.getChildKey(childOrMnemonic, checkSum));
    }
    return childOrMnemonic.privateKey;
  }

  getPubKey(privKey) {
    const pubKeyByte = secp256k1.publicKeyCreate(privKey);
    return pubKeyByte;
  }

  getPubKeyAny(privKey) {
    const pubKeyByte = secp256k1.publicKeyCreate(privKey);
    var buf1 = new Buffer.from([10]);
    var buf2 = new Buffer.from([pubKeyByte.length]);
    var buf3 = new Buffer.from(pubKeyByte);
    const pubKey = Buffer.concat([buf1, buf2, buf3]);
    const pubKeyAny = new message.google.protobuf.Any({
      type_url: '/cosmos.crypto.secp256k1.PubKey',
      value: pubKey
    });
    return pubKeyAny;
  }

  getPubKeyAnyWithPub(pubKeyBytes) {
    var buf1 = new Buffer.from([10]);
    var buf2 = new Buffer.from([pubKeyBytes.length]);
    var buf3 = new Buffer.from(pubKeyBytes);
    const pubKey = Buffer.concat([buf1, buf2, buf3]);
    const pubKeyAny = new message.google.protobuf.Any({
      type_url: '/cosmos.crypto.secp256k1.PubKey',
      value: pubKey
    });
    return pubKeyAny;
  }

  constructAuthInfoBytes(pubKeyAny, gas = 200000, fees = 0, sequence) {
    const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
      public_key: pubKeyAny,
      mode_info: {
        single: {
          mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT
        }
      },
      sequence
    });

    const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [signerInfo],
      fee: new message.cosmos.tx.v1beta1.Fee({
        amount: [{ denom: this.bech32MainPrefix, amount: isNaN(fees) ? "0" : String(fees) }],
        gas_limit: gas
      })
    });
    return message.cosmos.tx.v1beta1.AuthInfo.encode(authInfo).finish();
  }

  constructBodyBytes(msgAny, memo) {
    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgAny],
      memo,
    });
    return message.cosmos.tx.v1beta1.TxBody.encode(txBody).finish();
  }

  constructTxBytes(bodyBytes, authInfoBytes, signatures) {
    const txRaw = new message.cosmos.tx.v1beta1.TxRaw({
      body_bytes: bodyBytes, // has to collect body bytes & auth info bytes since Keplr overrides data when signing
      auth_info_bytes: authInfoBytes,
      signatures,
    });
    const txBytes = message.cosmos.tx.v1beta1.TxRaw.encode(txRaw).finish();
    return txBytes;
  }

  getAccounts(address) {
    return this.get(`/cosmos/auth/v1beta1/accounts/${address}`);
  }

  signRaw(message, privKey) {
    return secp256k1.ecdsaSign(message, privKey).signature;
  }

  sign(txBody, authInfo, accountNumber, privKey) {
    const bodyBytes = trimBuffer(message.cosmos.tx.v1beta1.TxBody.encode(txBody).finish());
    const authInfoBytes = message.cosmos.tx.v1beta1.AuthInfo.encode(authInfo).finish();

    const signDoc = new message.cosmos.tx.v1beta1.SignDoc({
      body_bytes: bodyBytes,
      auth_info_bytes: authInfoBytes,
      chain_id: this.chainId,
      account_number: Number(accountNumber)
    });
    const signMessage = trimBuffer(message.cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish());

    const hash = createHash('sha256').update(signMessage).digest();
    const sig = secp256k1.ecdsaSign(hash, privKey);

    const txRaw = new message.cosmos.tx.v1beta1.TxRaw({
      body_bytes: bodyBytes,
      auth_info_bytes: authInfoBytes,
      signatures: [sig.signature]
    });
    const txBytes = message.cosmos.tx.v1beta1.TxRaw.encode(txRaw).finish();

    return txBytes;
  }

  get(path) {
    return fetch(`${this.url}${path}`).then((res) => res.json());
  }

  post(path, data) {
    return fetch(`${this.url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then((res) => res.json());
  }

  // "BROADCAST_MODE_UNSPECIFIED", "BROADCAST_MODE_BLOCK", "BROADCAST_MODE_SYNC", "BROADCAST_MODE_ASYNC"
  broadcast(signedTxBytes, broadCastMode = 'BROADCAST_MODE_SYNC') {
    const txBytesBase64 = Buffer.from(signedTxBytes, 'binary').toString('base64');
    return this.post('/cosmos/tx/v1beta1/txs', { tx_bytes: txBytesBase64, mode: broadCastMode });
  }

  async submit(child, txBody, broadCastMode = 'BROADCAST_MODE_SYNC', fees = [{ denom: 'orai', amount: String(0) }], gas_limit = 200000, gasMultiplier = 1.3, timeoutHeight = 0, timeoutIntervalCheck = 5000) {
    const address = this.getAddress(child);
    const privKey = this.getECPairPriv(child);
    const pubKeyAny = this.getPubKeyAny(privKey);
    const data = await this.getAccounts(address);
    if (data.code) {
      if (data.code === 2) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: `The wallet address ${address} does not exist` };
      else throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: data.message ? data.message : `Unexpected error from the network: ${data}` };
    }

    // auto collect gas used if gas limit is auto
    // if (gas_limit === 'auto') {
    //   try {
    //     let txBodySimulate = JSON.parse(JSON.stringify(txBody)); // use this to have deep copy of object
    //     // use object destruction to not mutate the txBody struct when simulating
    //     let result = await this.simulate(child.publicKey, txBodySimulate);
    //     // if simulate returns ok => set new gas limit to gas used
    //     if (result && result.gas_info && result.gas_info.gas_used) gas_limit = Math.round(parseInt(result.gas_info.gas_used) * gasMultiplier);
    //     // error cases when simulating, need to throw error
    //     else if (result && result.code && result.code !== 0) throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: result.message };
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    // // remove value_raw from txBody to save data when POST to node
    // txBody.messages = txBody.messages.map(msg => ({ ...msg, value_raw: null }));

    // handle fees. If fee is number then it is gas price, calculate the actual fees. Amount should be int in string
    if (!isNaN(fees) && !isNaN(gas_limit)) fees = [{ denom: this.bech32MainPrefix, amount: (fees * gas_limit).toFixed(0).toString() }];

    // --------------------------------- (2)authInfo ---------------------------------
    const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
      public_key: pubKeyAny,
      mode_info: {
        single: {
          mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT
        }
      },
      sequence: data.account.sequence
    });

    const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [signerInfo],
      fee: new message.cosmos.tx.v1beta1.Fee({
        amount: fees,
        gas_limit
      })
    });

    const signedTxBytes = this.sign(txBody, authInfo, data.account.account_number, privKey);

    if (!timeoutHeight || timeoutHeight === 0) {
      const res = await this.broadcast(signedTxBytes, broadCastMode);
      return this.handleTxResult(res);
    } else {
      // use broadcast mode async to collect tx hash
      const res = await this.broadcast(signedTxBytes, 'BROADCAST_MODE_SYNC');
      // error that is not related to gas fees
      if (res.tx_response.code !== 0) return this.handleTxResult(res);
      const txHash = res.tx_response.txhash;
      const txResult = await this.handleTxTimeout(txHash, timeoutHeight, timeoutIntervalCheck);
      return this.handleTxResult(txResult);
    }
  }

  handleTxResult(res) {
    if (res.txhash) {
      throw { status: CONSTANTS.STATUS_CODE.TX_DISCARDED, message: res.message, txhash: res.txhash };
    }
    if (!res.tx_response) {
      throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: JSON.stringify(res) };
    }
    if (res.tx_response.code !== 0) {
      throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: res.tx_response.raw_log, txhash: res.tx_response.txhash };
    }
    return res;
  }

  async handleTxTimeout(txhash, timeoutHeight, timeoutIntervalCheck) {
    while (true) {
      const blockData = await this.get(`/blocks/${timeoutHeight}`);
      // query tx hash. The tx can probably be included before the timeout check => check tx data before check timeout height
      let txData = await this.get(`/cosmos/tx/v1beta1/txs/${txhash}`);
      // happy case, has transaction then we return back to normal
      if (!txData.code) return txData;
      else {
        // cannot find tx case, check timeout height
        // if this block exists, it means the the network has reached the timeout height => tx has been flushed. return error
        if (!blockData.error) {
          return { txhash, message: "The transaction has been discarded due to low transaction fees. Please increase the gas price re-submit your transaction." }
        }
        // has not reached timeout height. sleep for timeout interval then repeat
        await new Promise(r => setTimeout(r, timeoutIntervalCheck));
      }
    }
  }

  //////////////////////////////////////////////////////////// simulate related methods
  getPubkeyAnySimulate(pubKeyBytes) {
    var buf1 = new Buffer.from([10]);
    var buf2 = new Buffer.from([pubKeyBytes.length]);
    var buf3 = new Buffer.from(pubKeyBytes);
    const pubKey = Buffer.concat([buf1, buf2, buf3]);
    return {
      "@type": '/cosmos.crypto.secp256k1.PubKey',
      "key": pubKey.toString('base64')
    };
  }

  // rename key type_url to @type. Also flatten the value_raw
  renameKeys(obj) {
    const keyValues = Object.entries(obj).map(([key, value]) => {
      let newKey = null
      // clean all value obj when simulation
      if (key === "value") {
        obj[key] = null;
      }
      if (key === "type_url") {
        newKey = "@type"
      } else {
        // we skip this key, and move on to the next recursively to flatten it out
        if (key === "value_raw") {
          return this.renameKeys(value);
        }
        newKey = key
      }
      if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
        obj[key] = this.renameKeys(value);
      }
      else if (value instanceof Array) {
        obj[key] = value.map(obj => this.renameKeys(obj));
      }
      return {
        [newKey]: obj[key]
      };
    });
    return Object.assign({}, ...keyValues);
  }

  async simulate(publicKey, txBody) {
    const pubKeyAny = this.getPubkeyAnySimulate(publicKey);
    const address = this.getAddressFromPub(publicKey);
    const data = await this.getAccounts(address);
    if (data.code) {
      if (data.code === 2) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: `The wallet address ${address} does not exist` };
      else throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: data.message ? data.message : `Unexpected error from the network: ${data}` };
    }
    // --------------------------------- (2)authInfo ---------------------------------

    const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
      public_key: pubKeyAny,
      mode_info: {
        single: {
          mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_UNSPECIFIED
        }
      },
      sequence: data.account.sequence
    });

    const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [signerInfo],
      fee: {
        amount: [],
        gas_limit: 0
      }
    });

    // // try converting msgs to simulate form
    // let newMessages = [];
    // for (let msg of txBody.messages) {
    //   if (!msg.value_raw) throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: "No raw message to simulate the transaction. Please add a value_raw field in message Any. Its value should be an object, not bytes" };
    //   // with simulate, the endpoint requires @type key, not type_url
    //   let newMessage = this.renameKeys(msg);

    //   // const typeUrl = msg.type_url.substring(1);
    //   // const urlArr = typeUrl.split(".");
    //   // let msgType = message;
    //   // for (let i = 0; i < urlArr.length; i++) {
    //   //   msgType = msgType[urlArr[i]]
    //   // }
    //   // const value = msgType.decode(msg.value)
    //   // // flatten the value object one time only, preserve the remaining nested object inside message value.
    //   newMessage = { ...newMessage, value: null, ...msg.value_raw }
    //   newMessages.push(newMessage)
    // }
    // txBody.messages = newMessages;

    const simulateTx = {
      tx: {
        body: txBody,
        authInfo,
        signatures: [Buffer.from("").toString('base64')],
      }
    }

    return fetch(`${this.url}/cosmos/tx/v1beta1/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulateTx)
    }).then((res) => res.json());
  }
}

Cosmos.message = message;
