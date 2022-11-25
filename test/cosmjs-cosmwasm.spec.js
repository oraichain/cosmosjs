import dotenv from 'dotenv';
import assert from 'assert';
import Cosmos from '../src';
import Long from 'long';
import AminoTypes from '../src/messages/amino';
import { Secp256k1HdWallet, makeSignDoc } from '@cosmjs/amino';
import { assertIsBroadcastTxSuccess, GasPrice, SigningStargateClient, StargateClient } from '@cosmjs/stargate';

dotenv.config();

const cosmos = new Cosmos('https://lcd.orai.io', 'Oraichain');
cosmos.setBech32MainPrefix('orai');

describe('cosmjs-cosmwasm', () => {
  it('should broadcast successfully', async () => {
    const message = Cosmos.message;
    const mnemonic = process.env.SEND_MNEMONIC;
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'orai' });
    const [firstAccount] = await wallet.getAccounts();
    const amount = null;

    const rpcEndpoint = 'https://rpc.orai.io';
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, { prefix: 'orai', gasPrice: GasPrice.fromString('0orai') });

    const sent_funds = amount ? [{ denom: cosmos.bech32MainPrefix, amount }] : [];
    console.log('sent funds: ', sent_funds);

    const msgExecuteContract = {
      type: 'wasm/MsgExecuteContract',
      value: {
        contract: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
        msg: { transfer: { amount: '1', recipient: 'orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573' } },
        sender: 'orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573',
        sent_funds
      }
    };
    const memo = '';

    const types = new AminoTypes();

    const senderData = await cosmos.getAccounts(firstAccount.address);

    const signDoc = makeSignDoc(
      [msgExecuteContract],
      { amount: [{ denom: 'orai', amount: '0' }], gas: '200000' },
      cosmos.chainId,
      memo,
      senderData.account.account_number,
      senderData.account.sequence
    );

    const result = await wallet.signAmino(firstAccount.address, signDoc);
    console.log('signature msg execute contract: ', result.signature.signature);
    const msgExecuteProto = types.fromAmino(result.signed.msgs[0]);
    console.log('msg execute contract: ', message.cosmwasm.wasm.v1.MsgExecuteContract.decode(msgExecuteProto.value));
    const bodyBytes = cosmos.constructBodyBytes(msgExecuteProto, result.signed.memo);
    const pubKeyAny = cosmos.getPubKeyAnyWithPub(firstAccount.pubkey);
    const authInfoBytes = cosmos.constructAuthInfoBytes(pubKeyAny, 200000, [{ denom: 'orai', amount: '0' }], senderData.account.sequence, 127);
    const tx = cosmos.constructSignedTxBytes(bodyBytes, authInfoBytes, [Buffer.from(result.signature.signature, 'base64')]);
    const txResult = await client.broadcastTx(tx);
    console.log('result: ', result);
  });
});
