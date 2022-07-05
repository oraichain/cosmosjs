import dotenv from 'dotenv';
import { Secp256k1HdWallet, g, makeSignDoc } from "@cosmjs/amino";
import { assertIsBroadcastTxSuccess, GasPrice, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import Cosmos from '../src';

dotenv.config();

const cosmos = new Cosmos('https://testnet.lcd.orai.io', 'Oraichain-testnet');
cosmos.setBech32MainPrefix('orai');

describe('cosmjs-send', () => {
  it('should broadcast successfully', async () => {
    const message = Cosmos.message;
    const mnemonic = process.env.SEND_MNEMONIC;
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'orai' });
    const [firstAccount] = await wallet.getAccounts();

    const rpcEndpoint = "https://testnet-rpc.orai.io";
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, { prefix: 'orai', gasPrice: GasPrice.fromString("0orai") });

    const recipient = "orai123rm6nkcuwgnsr7grdg0cpkpvchx9xsa8l7x7d";

    const msgSend = {
      type: 'cosmos-sdk/MsgSend',
      value: {
        from_address: firstAccount.address,
        to_address: recipient,
        amount: [{
          denom: "orai",
          amount: "10",
        }],
      }
    }
    const memo = 'submit';

    const msg = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: firstAccount.address,
      to_address: recipient,
      amount: msgSend.value.amount // 10
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgSend',
      value: message.cosmos.bank.v1beta1.MsgSend.encode(msg).finish(),
    });

    const senderData = await cosmos.getAccounts(firstAccount.address);

    const signDoc = makeSignDoc([msgSend], { amount: [{ "denom": "orai", "amount": "0" }], gas: "200000" }, "Oraichain-testnet", memo, senderData.account.account_number, senderData.account.sequence);

    const result = await wallet.signAmino(firstAccount.address, signDoc);
    console.log("result: ", result)

    const bodyBytes = cosmos.constructBodyBytes(msgSendAny, memo);
    const pubKeyAny = cosmos.getPubKeyAnyWithPub(firstAccount.pubkey);
    const authInfoBytes = cosmos.constructAuthInfoBytes(pubKeyAny, 200000, [{ "denom": "orai", "amount": "0" }], senderData.account.sequence, 127);
    const tx = cosmos.constructSignedTxBytes(bodyBytes, authInfoBytes, [Buffer.from(result.signature.signature, 'base64')])
    const txResult = await client.broadcastTx(tx);
    console.log("result: ", result);

    // const result = await client.signAndBroadcast(firstAccount.address, [msgSend], 0, "submit");
    // assertIsBroadcastTxSuccess(result);
    // console.log("result: ", result);
  });
});
