import Wallet from "./wallet";
import WalletChild from "./walletChild";
import WalletSigner from "./walletSigner";

export default class WalletFactory {

  constructor(signerOrChild, cosmos) {
    if (signerOrChild.getAccounts === undefined) this.wallet = new WalletChild(signerOrChild, cosmos);
    else this.wallet = new WalletSigner(signerOrChild, cosmos);
  }
}