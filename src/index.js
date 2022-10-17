import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bech32 from 'bech32';
import secp256k1 from 'secp256k1';
import message from './messages/proto';
import CONSTANTS from './constants';
import { trimBuffer, hash160 } from './utils';
import WalletFactory from './wallet/walletFactory';
import WalletSigner from './wallet/walletSigner';
import AminoTypes from './messages/amino';
import Axios from 'axios';

const TIMEOUT = 30000;

export default class Cosmos {
  constructor(url, chainId, bech32MainPrefix = "orai", hdPath = "m/44'/118'/0'/0/0") {
    // strip / at end
    this.url = url.replace(/\/$/, '');
    this.chainId = chainId;
    this.path = hdPath;
    this.bech32MainPrefix = bech32MainPrefix;
    this.axios = Axios.create({
      baseURL: this.url,
      headers: {
        Accept: 'application/json',
      },
      timeout: TIMEOUT,
    });
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

  getAddressFromPub(pubkey, prefix) {
    const words = bech32.toWords(hash160(pubkey));
    const address = bech32.encode(prefix ? prefix : this.bech32MainPrefix, words);
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

  getPubKeyAny(privKey) {
    const pubKeyByte = secp256k1.publicKeyCreate(privKey);
    return this.getPubKeyAnyWithPub(pubKeyByte);
  }

  constructAuthInfoBytes(pubKeyAny, gas_limit = 200000, fees = [{ denom: 'orai', amount: String(0) }], sequence, signMode = 1) {
    const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
      public_key: pubKeyAny,
      mode_info: {
        single: {
          mode: signMode
        }
      },
      sequence
    });

    const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [signerInfo],
      fee: new message.cosmos.tx.v1beta1.Fee({
        amount: Array.isArray(fees) ? fees : [{ denom: 'orai', amount: String(0) }],
        gas_limit
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

  constructTxBody({ messages, memo, timeout_height }) {
    return new message.cosmos.tx.v1beta1.TxBody({
      messages,
      memo,
      timeout_height
    });
  }

  constructSignedTxBytes(bodyBytes, authInfoBytes, signatures) {
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

  get(path) {
    return this.axios.get(path).then((res) => res.data).catch(err => err.response.data);
  }

  post(path, data) {
    return this.axios.post(path, data).then((res) => res.data).catch(err => err.response.data);
  }

  // "BROADCAST_MODE_UNSPECIFIED", "BROADCAST_MODE_BLOCK", "BROADCAST_MODE_SYNC", "BROADCAST_MODE_ASYNC"
  broadcast(signedTxBytes, broadCastMode = 'BROADCAST_MODE_SYNC') {
    const txBytesBase64 = Buffer.from(signedTxBytes, 'binary').toString('base64');
    return this.post('/cosmos/tx/v1beta1/txs', { tx_bytes: txBytesBase64, mode: broadCastMode });
  }

  async handleBroadcast(signedTxBytes, broadCastMode, timeoutHeight, timeoutIntervalCheck) {
    if (parseInt(timeoutHeight) <= 0) {
      const res = await this.broadcast(signedTxBytes, broadCastMode);
      return this.handleTxResult(res);
    }
    // use broadcast mode async to collect tx hash
    const res = await this.broadcast(signedTxBytes, 'BROADCAST_MODE_SYNC');
    // error that is not related to gas fees
    if (res.tx_response.code !== 0) return this.handleTxResult(res);
    const txHash = res.tx_response.txhash;
    const txResult = await this.handleTxTimeout(txHash, timeoutHeight, timeoutIntervalCheck);
    return this.handleTxResult(txResult);
  }

  async getWalletInfoFromSignerOrChild(signerOrChild) {
    const wallet = new WalletFactory(signerOrChild, this).wallet;
    return wallet.getWalletInfo();
  }

  async getSignerData(address) {
    const data = await this.getAccounts(address);
    if (data.code) {
      if (data.code === 2) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: `The wallet address ${address} does not exist` };
      else throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: data.message ? data.message : `Unexpected error from the network: ${data}` };
    }
    return data;
  }

  async sign(signerOrChild, bodyBytes, authInfoBytes, accountNumber, sender) {
    const { wallet } = new WalletFactory(signerOrChild, this);
    return wallet.sign(bodyBytes, authInfoBytes, accountNumber, sender);
  }

  async submit(signerOrChild, txBody, broadCastMode = 'BROADCAST_MODE_SYNC', fees = [{ denom: 'orai', amount: String(0) }], gas_limit = 200000, timeoutIntervalCheck = 0, isAmino = false) {
    if (!txBody) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: "The txBody are empty" };

    // collect wallet & signer data
    const { wallet } = new WalletFactory(signerOrChild, this);
    const { address, pubkey } = await wallet.getWalletInfo();
    const data = await this.getSignerData(address);
    const pubKeyAny = this.getPubKeyAnyWithPub(pubkey);

    // generate body & auth bytes to prepare broadcasting
    const authInfoBytes = this.constructAuthInfoBytes(pubKeyAny, gas_limit, fees, data.account.sequence);
    const bodyBytes = message.cosmos.tx.v1beta1.TxBody.encode(txBody).finish();
    var signedTxBytes;

    // filter signer type
    if (isAmino || (wallet instanceof WalletSigner && !signerOrChild.signDirect)) {
      const aminoType = new AminoTypes();
      const aminoMsgs = txBody.messages.map(msg => aminoType.toAmino(msg));
      signedTxBytes = await wallet.signAmino(aminoMsgs, bodyBytes, authInfoBytes, data.account.account_number, data.account.sequence, { amount: fees, gas: gas_limit.toString() }, txBody.memo, txBody.timeout_height, address);
    }
    else {
      signedTxBytes = await wallet.signDirect(bodyBytes, authInfoBytes, data.account.account_number, address);
    }

    return this.handleBroadcast(signedTxBytes, broadCastMode, txBody.timeout_height, timeoutIntervalCheck);
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

    const simulateTx = {
      tx: {
        body: txBody,
        authInfo,
        signatures: [Buffer.from("").toString('base64')],
      }
    }

    return this.axios.post(`/cosmos/tx/v1beta1/simulate`, simulateTx).then((res) => res.data);
  }
}

Cosmos.message = message;
