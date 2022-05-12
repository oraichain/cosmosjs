import { isOfflineDirectSigner } from "@cosmjs/proto-signing";
import Wallet from "./wallet";
import WalletChild from "./walletChild";
import WalletSigner from "./walletSigner";

export default class WalletFactory {

  constructor(signerOrChild, cosmos) {
    if (!isOfflineDirectSigner(signerOrChild)) this.wallet = new WalletChild(signerOrChild, cosmos);
    else this.wallet = new WalletSigner(signerOrChild, cosmos);
  }
}