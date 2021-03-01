/*
    Developed / Developing by Cosmostation
    [WARNING] CosmosJS is under ACTIVE DEVELOPMENT and should be treated as alpha version. We will remove this warning when we have a release that is stable, secure, and propoerly tested.
*/
import fetch from 'node-fetch';
import request from 'request';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bech32 from 'bech32';
import secp256k1 from 'secp256k1';
import crypto from 'crypto';
import message from './messages/proto';

Buffer.prototype.trim = function () {
  const hex = this.toString('hex').replace(/2000$/, '');
  return Buffer.from(hex, 'hex');
};

export class Cosmos {
  constructor(url, chainId) {
    this.url = url;
    this.chainId = chainId;
    this.path = "m/44'/118'/0'/0/0";
    this.bech32MainPrefix = 'cosmos';
  }

  setBech32MainPrefix(value) {
    this.bech32MainPrefix = value;
    if (!this.bech32MainPrefix)
      throw new Error('bech32MainPrefix object was not set or invalid');
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
      if (!bip39.validateMnemonic(mnemonic))
        throw new Error('mnemonic phrases have invalid checksums');
    }
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    return node.derivePath(this.path);
  }

  getAddress(child) {
    const words = bech32.toWords(child.identifier);
    return bech32.encode(this.bech32MainPrefix, words);
  }

  getECPairPriv(child) {
    return child.privateKey;
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

  getAccounts(address) {
    const accountsApi = '/cosmos/auth/v1beta1/accounts/';
    return fetch(this.url + accountsApi + address).then((response) =>
      response.json()
    );
  }

  sign(txBody, authInfo, accountNumber, privKey) {
    const bodyBytes = message.cosmos.tx.v1beta1.TxBody.encode(txBody)
      .finish()
      .trim();
    const authInfoBytes = message.cosmos.tx.v1beta1.AuthInfo.encode(
      authInfo
    ).finish();

    const signDoc = new message.cosmos.tx.v1beta1.SignDoc({
      body_bytes: bodyBytes,
      auth_info_bytes: authInfoBytes,
      chain_id: this.chainId,
      account_number: Number(accountNumber)
    });
    const signMessage = message.cosmos.tx.v1beta1.SignDoc.encode(signDoc)
      .finish()
      .trim();

    const hash = crypto.createHash('sha256').update(signMessage).digest();
    const sig = secp256k1.sign(hash, Buffer.from(privKey));

    const txRaw = new message.cosmos.tx.v1beta1.TxRaw({
      body_bytes: bodyBytes,
      auth_info_bytes: authInfoBytes,
      signatures: [sig.signature]
    });
    const txBytes = message.cosmos.tx.v1beta1.TxRaw.encode(txRaw).finish();

    return txBytes;
  }

  // "BROADCAST_MODE_UNSPECIFIED", "BROADCAST_MODE_BLOCK", "BROADCAST_MODE_SYNC", "BROADCAST_MODE_ASYNC"
  broadcast(signedTxBytes, broadCastMode = 'BROADCAST_MODE_SYNC') {
    const txBytesBase64 = Buffer.from(signedTxBytes, 'binary').toString(
      'base64'
    );

    var options = {
      method: 'POST',
      url: this.url + '/cosmos/tx/v1beta1/txs',
      headers: { 'Content-Type': 'application/json' },
      body: { tx_bytes: txBytesBase64, mode: broadCastMode },
      json: true
    };

    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (error) return reject(error);
        try {
          resolve(body);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  async submit(child, txBody, broadCastMode = 'BROADCAST_MODE_SYNC') {
    const address = this.getAddress(child);
    const privKey = this.getECPairPriv(child);
    const pubKeyAny = this.getPubKeyAny(privKey);

    const data = await this.getAccounts(address);

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

    const feeValue = new message.cosmos.tx.v1beta1.Fee({
      gas_limit: 200000
    });

    const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [signerInfo],
      fee: feeValue
    });

    const signedTxBytes = this.sign(
      txBody,
      authInfo,
      data.account.account_number,
      privKey
    );

    return this.broadcast(signedTxBytes, broadCastMode);
  }
}
