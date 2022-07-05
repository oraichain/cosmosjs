import { BIP32Interface } from "bip32";
import Cosmos from "..";
import Wallet from "./wallet";
import Long from 'long';
import AminoTypes from "../messages/amino";

export default class WalletSigner extends Wallet {
  constructor(signerOrChild, cosmos) {
    super(signerOrChild, cosmos);
  }

  async getWalletInfo() {
    const [firstAccount] = await this.signerOrChild.getAccounts();
    return { address: firstAccount.address, pubkey: firstAccount.pubkey };
  }

  async signDirect(bodyBytes, authInfoBytes, accountNumber, sender) {
    const response = await this.signerOrChild.signDirect(sender, {
      bodyBytes,
      authInfoBytes,
      chainId: this.cosmos.chainId,
      accountNumber,
    });
    const signature = Buffer.from(response.signature.signature, "base64");
    return this.cosmos.constructSignedTxBytes(response.signed.bodyBytes, response.signed.authInfoBytes, [signature]);
  }

  // this function is implemented solely for Keplr extension case since its auth info may change 
  handleNewAuthInfoBytes(authInfoBytes, newFee) {
    const authInfo = this.message.cosmos.tx.v1beta1.AuthInfo.decode(authInfoBytes);
    const fee = new this.message.cosmos.tx.v1beta1.Fee({ ...newFee, gas_limit: new Long(parseInt(newFee.gas)) });
    const newAuthInfo = new this.message.cosmos.tx.v1beta1.AuthInfo({ ...authInfo, fee });
    return this.message.cosmos.tx.v1beta1.AuthInfo.encode(newAuthInfo).finish();
  }

  handleNewBodyBytes(bodyBytes, aminoMsgs, memo) {
    const aminoTypes = new AminoTypes();
    const oldTxBody = this.message.cosmos.tx.v1beta1.TxBody.decode(bodyBytes);
    const newTxBody = new this.message.cosmos.tx.v1beta1.TxBody({ ...oldTxBody, memo, messages: aminoMsgs.map(message => aminoTypes.fromAmino(message)) });
    return this.message.cosmos.tx.v1beta1.TxBody.encode(newTxBody).finish();
  }

  async signAmino(msgs, bodyBytes, authInfoBytes, accountNumber, sequence, fee, memo, sender) {
    const signDoc = this.makeSignDoc(msgs, accountNumber, sequence, fee, memo);
    const response = await this.signerOrChild.signAmino(signDoc.chain_id, sender, signDoc);
    const signature = Buffer.from(response.signature.signature, "base64");
    const newAuthInfoBytes = this.handleNewAuthInfoBytes(this.getAminoAuthInfoBytes(authInfoBytes), response.signed.fee);
    return this.cosmos.constructSignedTxBytes(this.handleNewBodyBytes(bodyBytes, response.signed.msgs, response.signed.memo), newAuthInfoBytes, [signature]);
  }
}