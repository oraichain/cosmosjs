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
    const bodyBytesRaw = bodyBytes;
    const signDoc = new this.message.cosmos.tx.v1beta1.SignDoc({
      body_bytes: [
        10, 61, 10, 28, 47, 99, 111, 115, 109, 111, 115, 46,
        98, 97, 110, 107, 46, 118, 49, 98, 101, 116, 97, 49,
        46, 77, 115, 103, 83, 101, 110, 100, 18, 29, 10, 6,
        102, 111, 111, 98, 97, 114, 18, 6, 102, 111, 111, 98,
        97, 114, 26, 11, 10, 6, 102, 111, 111, 98, 97, 114,
        18, 1, 48, 18, 6, 115, 117, 98, 109, 105, 116
      ],
      auth_info_bytes: [
        10, 78, 10, 70, 10, 31, 47, 99, 111, 115, 109, 111,
        115, 46, 99, 114, 121, 112, 116, 111, 46, 115, 101, 99,
        112, 50, 53, 54, 107, 49, 46, 80, 117, 98, 75, 101,
        121, 18, 35, 10, 33, 2, 92, 51, 66, 167, 70, 56,
        216, 64, 133, 48, 180, 69, 85, 89, 166, 158, 108, 171,
        124, 137, 250, 106, 100, 171, 219, 241, 112, 201, 253, 156,
        117, 58, 18, 4, 10, 2, 8, 1, 18, 15, 10, 9,
        10, 4, 111, 114, 97, 105, 18, 1, 48, 16, 192, 154,
        12
      ],
      chain_id: this.cosmos.chainId,
      account_number: Number(0)
    });
    const signMessage = this.message.cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish();
    console.log("sign message: ", Buffer.from(signMessage).toString('base64'))

    console.log("sign docs: ", signDoc)
    console.log("body bytes: ", [...signDoc.body_bytes])
    console.log("auth info bytes: ", [...signDoc.auth_info_bytes]);

    const hash = createHash('sha256').update(signMessage).digest();
    console.log("hash: ", hash.toString('hex'));
    const sig = secp256k1.ecdsaSign(hash, this.signerOrChild.privateKey);
    console.log("signature: ", Buffer.from(sig.signature).toString('base64'))

    const verified = secp256k1.ecdsaVerify(sig.signature, hash, this.signerOrChild.publicKey);
    console.log("pubkey: ", Buffer.from(this.signerOrChild.publicKey).toString('base64'));
    console.log("verified: ?", verified)

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