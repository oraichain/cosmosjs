import Wallet from "./wallet";
import { trimBuffer } from "../utils";
import { createHash } from 'crypto';
import secp256k1 from 'secp256k1';

export default class WalletChild extends Wallet {
  constructor(signerOrChild, cosmos) {
    super(signerOrChild, cosmos);
  }

  async getWalletInfo() {
    return { address: this.cosmos.getAddress(this.signerOrChild), pubkey: this.signerOrChild.publicKey };
  }

  async sign(bodyBytes, authInfoBytes, accountNumber, sender) {
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
}