declare class Cosmos {
    constructor(url: any, chainId: any);
    url: any;
    chainId: any;
    path: string;
    bech32MainPrefix: string;
    setBech32MainPrefix(value: any): void;
    setPath(value: any): void;
    getChildKey(mnemonic: any, checkSum?: boolean): bip32.BIP32Interface;
    getAddress(childOrMnemonic: any, checkSum?: boolean): any;
    getECPairPriv(childOrMnemonic: any, checkSum?: boolean): any;
    getPubKey(privKey: any): any;
    getPubKeyAny(privKey: any): any;
    getAccounts(address: any): Promise<any>;
    sign(txBody: any, authInfo: any, accountNumber: any, privKey: any): any;
    getTxs(txHash: any): Promise<any>;
    broadcast(signedTxBytes: any, broadCastMode?: string): Promise<any>;
    submit(child: any, txBody: any, broadCastMode?: string, fees?: number, gas_limit?: number): Promise<any>;
}
declare namespace Cosmos {
    export { message };
}
export default Cosmos;
import * as bip32 from "bip32";
import message from "./messages/proto";
