import { OfflineDirectSigner, Coin } from '@cosmjs/proto-signing';
import { OfflineAminoSigner } from '@cosmjs/amino';
import * as bip32 from 'bip32';
import message from './messages/proto';
export type BroadCastMode = 'BROADCAST_MODE_UNSPECIFIED' | 'BROADCAST_MODE_BLOCK' | 'BROADCAST_MODE_SYNC' | 'BROADCAST_MODE_ASYNC';

export type ExtensionData = {
  txBody: message.cosmos.tx.v1beta1.TxBody,
  gas?: number,
  fees?: Coin[],
  broadCastMode?: BroadCastMode,
}
declare class Cosmos {
  constructor(url: string, chainId: string, bech32MainPrefix?: string, hdPath?: string);
  url: string;
  chainId: string;
  path: string;
  bech32MainPrefix: string;
  get(path: string): Promise<any>;
  post(path: string, data: object): Promise<any>;
  setBech32MainPrefix(value: string): void;
  setPath(value: any): void;
  getChildKey(mnemonic: any, checkSum?: boolean): bip32.BIP32Interface;
  static getChildKeyStatic(mnemonic: any, path: string, checkSum?: boolean): bip32.BIP32Interface;
  generateMnemonic(strength?: number): string;
  getAddress(childOrMnemonic: any, checkSum?: boolean): string;
  getAddressFromPub(publicKey: Buffer, prefix?: string): string;
  getAddressStr(operatorAddr: string): string;
  getValidatorAddress(childOrMnemonic: any, checkSum?: boolean): string;
  getOperatorAddressStr(addr: string): string;
  get statusCode(): number;
  getECPairPriv(childOrMnemonic: any, checkSum?: boolean): Buffer;
  getPubKey(privKey: Uint8Array): Uint8Array;
  getPubKeyAny(privKey: Uint8Array): message.google.protobuf.Any;
  constructBodyBytes(msgAny: any, memo: String): Uint8Array;
  constructTxBody(body: { messages: any[], memo?: string, timeout_height?: number }): message.cosmos.tx.v1beta1.TxBody;
  constructAuthInfoBytes(pubKeyAny: message.google.protobuf.Any, gas: number, fees: number, sequence: number, signMode?: number): Uint8Array
  constructSignedTxBytes(bodyBytes: Uint8Array, authInfoBytes: Uint8Array, signatures: Uint8Array[]): Uint8Array
  getPubKeyAnyWithPub(pubKeyBytes: Uint8Array): message.google.protobuf.Any;
  getAccounts(address: string): Promise<any>;
  signRaw(message: Buffer, privKey: Uint8Array): Uint8Array;
  // sign(bodyBytes: Uint8Array, authInfoBytes: Uint8Array, accountNumber: any, privKey: Uint8Array): Uint8Array;
  getWalletInfoFromSignerOrChild(signerOrChild: bip32.BIP32Interface | OfflineDirectSigner): Promise<{ address: string, pubkey: Uint8Array }>;
  sign(signerOrChild: bip32.BIP32Interface | OfflineDirectSigner, bodyBytes: Uint8Array, authInfoBytes: Uint8Array, accountNumber: number, address: string): Promise<Uint8Array>;
  broadcast(signedTxBytes: any, broadCastMode?: BroadCastMode): Promise<any>;
  submit(signerOrChild: bip32.BIP32Interface | OfflineDirectSigner | OfflineAminoSigner, txBody: message.cosmos.tx.v1beta1.TxBody, broadCastMode?: BroadCastMode, fees?: Coin[], gas_limit?: number, timeoutIntervalCheck?: number, isAmino?: boolean): Promise<any>;
  simulate(publicKey: Buffer, txBody: message.cosmos.tx.v1beta1.TxBody): Promise<any>;
}
declare namespace Cosmos {
  export { message };
}
export default Cosmos;
