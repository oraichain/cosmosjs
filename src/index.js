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
import { isOfflineDirectSigner } from '@cosmjs/proto-signing';

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

  constructAuthInfoBytes(pubKeyAny, gas_limit = 200000, fees = [{ denom: 'orai', amount: String(0) }], sequence) {
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
        amount: isNaN(fees) ? fees : [{ denom: "orai", amount: String(fees) }],
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

  sign(bodyBytes, authInfoBytes, accountNumber, privKey) {
    const bodyBytesRaw = trimBuffer(bodyBytes);
    const signDoc = new message.cosmos.tx.v1beta1.SignDoc({
      body_bytes: bodyBytesRaw,
      auth_info_bytes: authInfoBytes,
      chain_id: this.chainId,
      account_number: Number(accountNumber)
    });
    const signMessage = trimBuffer(message.cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish());

    const hash = createHash('sha256').update(signMessage).digest();
    const sig = secp256k1.ecdsaSign(hash, privKey);

    return this.constructSignedTxBytes(bodyBytes, authInfoBytes, [sig.signature]);
  }

  async signExtension(signer, sender, bodyBytes, authInfoBytes, accountNumber) {
    const response = await signer.signDirect(sender, {
      bodyBytes,
      authInfoBytes,
      chainId: this.chainId,
      accountNumber,
    });
    const signature = Buffer.from(response.signature.signature, "base64");
    return this.constructSignedTxBytes(response.signed.bodyBytes, response.signed.authInfoBytes, [signature]);
  }

  handleFetchResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      let responseText = await response.text();
      throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: responseText }
    }
  }

  get(path) {
    return fetch(`${this.url}${path}`).then((res) => this.handleFetchResponse(res));
  }

  post(path, data) {
    return fetch(`${this.url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then((res) => this.handleFetchResponse(res));
  }

  // "BROADCAST_MODE_UNSPECIFIED", "BROADCAST_MODE_BLOCK", "BROADCAST_MODE_SYNC", "BROADCAST_MODE_ASYNC"
  broadcast(signedTxBytes, broadCastMode = 'BROADCAST_MODE_SYNC') {
    const txBytesBase64 = Buffer.from(signedTxBytes, 'binary').toString('base64');
    return this.post('/cosmos/tx/v1beta1/txs', { tx_bytes: txBytesBase64, mode: broadCastMode });
  }

  async walletFactory(signerOrChild) {
    // simple null check
    if (!signerOrChild) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: "The signerOrChild object is empty" }
    // child key case for cli & mobile
    if (!isOfflineDirectSigner(signerOrChild)) return { address: this.getAddress(signerOrChild), pubkey: signerOrChild.publicKey, isChildKey: true };
    // offline signer case for extension on browser. TODO: how to handle the case where users don't use the first account?
    const [firstAccount] = await signerOrChild.getAccounts();
    return { address: firstAccount.address, pubkey: firstAccount.pubkey, isChildKey: false };
  }

  async submit(signerOrChild, txBody, broadCastMode = 'BROADCAST_MODE_SYNC', fees = [{ denom: 'orai', amount: String(0) }], gas_limit = 200000, timeoutIntervalCheck = 5000) {
    const { address, pubkey, isChildKey } = await this.walletFactory(signerOrChild);
    // simple tx body filter
    if (!txBody) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: "The txBody object is empty" };
    const pubKeyAny = this.getPubKeyAnyWithPub(pubkey);
    const data = await this.getAccounts(address);
    if (data.code) {
      if (data.code === 2) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: `The wallet address ${address} does not exist` };
      else throw { status: CONSTANTS.STATUS_CODE.GENERIC_ERROR, message: data.message ? data.message : `Unexpected error from the network: ${data}` };
    }

    const authInfoBytes = this.constructAuthInfoBytes(pubKeyAny, gas_limit, fees, data.account.sequence);
    const bodyBytes = message.cosmos.tx.v1beta1.TxBody.encode(txBody).finish();
    const signedTxBytes = isChildKey ? this.sign(bodyBytes, authInfoBytes, data.account.account_number, signerOrChild.privateKey) : await this.signExtension(signerOrChild, address, bodyBytes, authInfoBytes, data.account.account_number);

    if (!txBody.timeout_height) {
      const res = await this.broadcast(signedTxBytes, broadCastMode);
      return this.handleTxResult(res);
    }
    // use broadcast mode async to collect tx hash
    const res = await this.broadcast(signedTxBytes, 'BROADCAST_MODE_SYNC');
    // error that is not related to gas fees
    if (res.tx_response.code !== 0) return this.handleTxResult(res);
    const txHash = res.tx_response.txhash;
    const txResult = await this.handleTxTimeout(txHash, txBody.timeout_height, timeoutIntervalCheck);
    return this.handleTxResult(txResult);
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

    return fetch(`${this.url}/cosmos/tx/v1beta1/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(simulateTx)
    }).then((res) => this.handleFetchResponse(res));
  }
}

Cosmos.message = message;
