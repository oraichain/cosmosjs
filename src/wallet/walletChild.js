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
      account_number: Number(0)
    });

    console.log("sign docs: ", signDoc)

    const signMessage = this.message.cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish();

    const hash = createHash('sha256').update(signMessage).digest();
    console.log("hash: ", hash);
    const sig = secp256k1.ecdsaSign(hash, this.signerOrChild.privateKey);
    console.log("signature: ", Buffer.from(sig.signature).toString('base64'))

    const verified = secp256k1.ecdsaVerify(sig.signature, hash, this.signerOrChild.publicKey);
    console.log("pubkey: ", Buffer.from(this.signerOrChild.publicKey).toString('base64'));
    console.log("verified: ?", verified)

    return this.cosmos.constructSignedTxBytes(bodyBytes, authInfoBytes, [sig.signature]);
  }

  async signAmino(msgs, bodyBytes, authInfoBytes, accountNumber, sequence, fee, memo, sender) {
    const signDoc = this.makeSignDoc(msgs, accountNumber, sequence, fee, memo);
    const signDocBytes = Buffer.from(JSON.stringify(sortObject(signDoc)));
    console.log(JSON.stringify(sortObject(signDoc)))
    const hash = createHash('sha256').update(signDocBytes).digest();
    const sig = secp256k1.ecdsaSign(hash, this.signerOrChild.privateKey);
    // create new auth info with sign mode as legacy amino
    const newAuthInfoBytes = this.getAminoAuthInfoBytes(authInfoBytes);

    console.log("body bytes: ", Uint8Array.from(bodyBytes));
    console.log("new auth info bytes: ", Uint8Array.from(newAuthInfoBytes));

    return this.cosmos.constructSignedTxBytes(bodyBytes, newAuthInfoBytes, [sig.signature]);
  }
}