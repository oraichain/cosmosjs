import dotenv from 'dotenv';
import { Secp256k1HdWallet, makeSignDoc } from "@cosmjs/amino";
import { assertIsBroadcastTxSuccess, GasPrice, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import Cosmos from '../src';
import Long from 'long';
import AminoTypes from '../src/messages/amino';

dotenv.config();

const cosmos = new Cosmos('https://lcd.orai.io', 'Oraichain');
cosmos.setBech32MainPrefix('orai');

describe('cosmjs-ibc', () => {
  it('should broadcast successfully', async () => {
    const message = Cosmos.message;
    const mnemonic = process.env.SEND_MNEMONIC;
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'orai' });
    const [firstAccount] = await wallet.getAccounts();

    const rpcEndpoint = "https://rpc.orai.io";
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, { prefix: 'orai', gasPrice: GasPrice.fromString("0orai") });

    const receiver = "cosmos14n3tx8s5ftzhlxvq0w5962v60vd82h30sythlz";

    const msgSend = {
      type: 'cosmos-sdk/MsgTransfer',
      value: {
        receiver,
        sender: firstAccount.address,
        source_channel: 'channel-15',
        source_port: 'transfer',
        timeout_timestamp: "1756918167000000000",
        token: { denom: 'ibc/A2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78', amount: '1' },
      },
    }
    const memo = '';

    const types = new AminoTypes();

    const senderData = await cosmos.getAccounts(firstAccount.address);

    const signDoc = makeSignDoc([msgSend], { amount: [{ "denom": "orai", "amount": "0" }], gas: "200000" }, cosmos.chainId, memo, senderData.account.account_number, senderData.account.sequence);

    const result = await wallet.signAmino(firstAccount.address, signDoc);
    console.log("signature cosmjs ibc: ", result.signature.signature);
    const msgIbc = types.fromAmino(result.signed.msgs[0]);
    const bodyBytes = cosmos.constructBodyBytes(msgIbc, result.signed.memo);
    const pubKeyAny = cosmos.getPubKeyAnyWithPub(firstAccount.pubkey);
    const authInfoBytes = cosmos.constructAuthInfoBytes(pubKeyAny, 200000, [{ "denom": "orai", "amount": "0" }], senderData.account.sequence, 127);
    const tx = cosmos.constructSignedTxBytes(bodyBytes, authInfoBytes, [Buffer.from(result.signature.signature, 'base64')])
    // const txResult = await client.broadcastTx(tx);
    // console.log("result: ", result);

    // const result = await client.signAndBroadcast(firstAccount.address, [msgSend], 0, "submit");
    // assertIsBroadcastTxSuccess(result);
    // console.log("result: ", result);
  });
});
