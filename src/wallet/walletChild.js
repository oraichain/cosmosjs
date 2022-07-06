import Wallet from "./wallet";
import { trimBuffer } from "../utils";
import { createHash } from 'crypto';
import secp256k1 from 'secp256k1';

function sortObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key) => {
    result[key] = sortObject(obj[key]);
  });
  return result;
}

export default class WalletChild extends Wallet {
  constructor(signerOrChild, cosmos) {
    super(signerOrChild, cosmos);
  }

  async getWalletInfo() {
    return { address: this.cosmos.getAddress(this.signerOrChild), pubkey: this.signerOrChild.publicKey };
  }

  async signDirect(bodyBytes, authInfoBytes, accountNumber, sender) {
    const bodyBytesRaw = trimBuffer(bodyBytes);
    const signDoc = new this.message.cosmos.tx.v1beta1.SignDoc({
      body_bytes: bodyBytesRaw,
      auth_info_bytes: authInfoBytes,
      chain_id: this.cosmos.chainId,
      account_number: Number(accountNumber)
    });
    const signMessage = trimBuffer(this.message.cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish());

    const hash = createHash('sha256').update(signMessage).digest();
    const sig = secp256k1.ecdsaSign(hash, this.signerOrChild.privateKey);

    return this.cosmos.constructSignedTxBytes(bodyBytes, authInfoBytes, [sig.signature]);
  }

  async signAmino(msgs, bodyBytes, authInfoBytes, accountNumber, sequence, fee, memo, timeoutHeight, sender) {
    const signDoc = this.makeSignDoc(msgs, accountNumber, sequence, fee, memo, timeoutHeight);
    const signDocBytes = Buffer.from(JSON.stringify(sortObject(signDoc)));
    const hash = createHash('sha256').update(signDocBytes).digest();
    const sig = secp256k1.ecdsaSign(hash, this.signerOrChild.privateKey);
    // create new auth info with sign mode as legacy amino
    const newAuthInfoBytes = this.getAminoAuthInfoBytes(authInfoBytes);
    return this.cosmos.constructSignedTxBytes(bodyBytes, newAuthInfoBytes, [sig.signature]);
  }
}