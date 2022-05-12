import { BIP32Interface } from "bip32";
import Cosmos from "..";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";
import Wallet from "./wallet";

export default class WalletSigner extends Wallet {
  constructor(signerOrChild, cosmos) {
    super(signerOrChild, cosmos);
  }

  async getWalletInfo() {
    const [firstAccount] = await this.signerOrChild.getAccounts();
    return { address: firstAccount.address, pubkey: firstAccount.pubkey };
  }

  async sign(bodyBytes, authInfoBytes, accountNumber, sender) {
    const response = await data.signer.signDirect(sender, {
      bodyBytes,
      authInfoBytes,
      chainId: this.cosmos.chainId,
      accountNumber,
    });
    const signature = Buffer.from(response.signature.signature, "base64");
    return this.cosmos.constructSignedTxBytes(response.signed.bodyBytes, response.signed.authInfoBytes, [signature]);
  }
}