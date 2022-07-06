import Cosmos from "..";
import CONSTANTS from "../constants";
import Long from 'long'

export default class Wallet {

  constructor(signerOrChild, cosmos) {
    if (!signerOrChild) throw { status: CONSTANTS.STATUS_CODE.NOT_FOUND, message: "The signerOrChild object is empty" }
    this.signerOrChild = signerOrChild;
    this.cosmos = cosmos;
    this.message = Cosmos.message;
  }

  async getWalletInfo() {
    throw new Error("Method 'getWalletInfo()' must be implemented.");
  }

  async signDirect(bodyBytes, authInfoBytes, accountNumber, sender) {
    throw new Error("Method 'sign_direct()' must be implemented.");
  }
  async signAmino(msgs, bodyBytes, authInfoBytes, accountNumber, sequence, fee, memo, timeout_height, sender) {
    throw new Error("Method 'sign_amino()' must be implemented.");
  }

  makeSignDoc(msgs, accountNumber, sequence, fee, memo, timeout_height) {
    return {
      account_number: accountNumber.toString(),
      chain_id: this.cosmos.chainId,
      fee: { ...fee, amount: Array.isArray(fee.amount) ? fee.amount : [{ denom: 'orai', amount: String(0) }] },
      memo: memo || "",
      msgs,
      sequence: sequence.toString(),
      timeout_height: ((timeout_height instanceof Long && timeout_height.equals(0)) || timeout_height === 0) ? undefined : timeout_height.toString(), // corner case: when timeout height is not passed => protobuf object will auto parse to Long(0), which will lead to signature verification failed => need to update to undefined
    }
  }

  getAminoAuthInfoBytes(authInfoBytes) {
    const authInfo = this.message.cosmos.tx.v1beta1.AuthInfo.decode(authInfoBytes);
    const newSignerInfos = authInfo.signer_infos.map(signerInfo => ({ ...signerInfo, mode_info: { single: { mode: this.message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON } } }));
    const newAuthInfo = new this.message.cosmos.tx.v1beta1.AuthInfo({ signer_infos: newSignerInfos, fee: authInfo.fee });
    return this.message.cosmos.tx.v1beta1.AuthInfo.encode(newAuthInfo).finish();
  }
}