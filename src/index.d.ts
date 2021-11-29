import * as bip32 from 'bip32';
import message from './messages/proto';
export type BroadCastMode = 'BROADCAST_MODE_UNSPECIFIED' | 'BROADCAST_MODE_BLOCK' | 'BROADCAST_MODE_SYNC' | 'BROADCAST_MODE_ASYNC';
declare class Cosmos {
  constructor(url: any, chainId: any);
  url: any;
  chainId: any;
  path: string;
  bech32MainPrefix: string;
  get(path: string): Promise<any>;
  post(path: string, data: object): Promise<any>;
  setBech32MainPrefix(value: any): void;
  setPath(value: any): void;
  getChildKey(mnemonic: any, checkSum?: boolean): bip32.BIP32Interface;
  generateMnemonic(strength?: number): string;
  getAddress(childOrMnemonic: any, checkSum?: boolean): any;
  getAddressStr(operatorAddr: string): string;
  getValidatorAddress(childOrMnemonic: any, checkSum?: boolean): any;
  getOperatorAddressStr(addr: string): string;
  get statusCode(): any;
  getECPairPriv(childOrMnemonic: any, checkSum?: boolean): Buffer;
  getPubKey(privKey: Uint8Array): Uint8Array;
  getPubKeyAny(privKey: Uint8Array): any;
  constructBodyBytes(msgAny: any, memo: String): Uint8Array;
  constructAuthInfoBytes(pubKeyAny: any, gas: number, fees: number, sequence: number)
  constructTxBytes(bodyBytes: Uint8Array, authInfoBytes: Uint8Array, signatures: Uint8Array[]): Uint8Array
  getPubKeyAnyWithPub(pubKeyBytes: Uint8Array): any;
  getAccounts(address: any): Promise<any>;
  signRaw(message: Buffer, privKey: Uint8Array): Uint8Array;
  sign(txBody: any, authInfo: any, accountNumber: any, privKey: Uint8Array): Uint8Array;
  getTxs(txHash: any): Promise<any>;
  broadcast(signedTxBytes: any, broadCastMode?: BroadCastMode): Promise<any>;
  submit(child: any, txBody: any, broadCastMode?: BroadCastMode, fees?: any[], gas_limit?: number): Promise<any>;
}
declare namespace Cosmos {
  export { message };
}
export default Cosmos;
