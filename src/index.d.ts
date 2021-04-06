import Message from './messages/proto';

export class Cosmos {
  constructor(url: string, chainId: string);
  url: string;
  chainId: string;
  path: string;
  bech32MainPrefix: string;
  setBech32MainPrefix(value: string): void;
  setPath(value: string): void;
  getChildKey(mnemonic: string, checkSum?: boolean): bip32.BIP32Interface;
  getAddress(childOrMnemonic: any, checkSum?: boolean): any;
  getECPairPriv(childOrMnemonic: any, checkSum?: boolean): any;
  getPubKey(privKey: any): any;
  getPubKeyAny(privKey: any): any;
  getAccounts(address: string): Promise<any>;
  sign(txBody: any, authInfo: any, accountNumber: any, privKey: any): any;
  getTxs(txHash: string): Promise<Message.cosmos.tx.v1beta1.GetTxResponse>;
  broadcast(signedTxBytes: any, broadCastMode?: string, gasLimit?: Long): Promise<Message.cosmos.tx.v1beta1.BroadcastTxResponse>;
  submit(child: any, txBody: Message.cosmos.tx.v1beta1.TxBody, broadCastMode?: string, fees?: number, gasLimit?: number): Promise<Message.cosmos.tx.v1beta1.BroadcastTxResponse>;
}
import * as bip32 from 'bip32';
