import Cosmos from "..";
import CONSTANTS from "../constants";

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

  async sign(bodyBytes, authInfoBytes, accountNumber, sender) {
    throw new Error("Method 'sign()' must be implemented.");
  }
}