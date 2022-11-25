import dotenv from 'dotenv';
import assert from 'assert';
import Cosmos from '../src';
import Long from 'long';

dotenv.config();

const cosmos = new Cosmos('https://lcd.orai.io', 'Oraichain');
cosmos.setBech32MainPrefix('orai');

describe('cosmosjs-cosmwasm', () => {
  it('should broadcast successfully', async () => {
    const message = Cosmos.message;
    const childKey = cosmos.getChildKey(process.env.SEND_MNEMONIC);
    const sender = cosmos.getAddress(childKey);
    const amount = null;

    const sent_funds = amount ? [{ denom: cosmos.bech32MainPrefix, amount }] : null;
    const msgSend = new message.cosmwasm.wasm.v1.MsgExecuteContract({
      contract: 'orai10ldgzued6zjp0mkqwsv2mux3ml50l97c74x8sg',
      msg: Buffer.from(JSON.stringify({ transfer: { recipient: 'orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573', amount: '1' } })),
      sender: 'orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573',
      sent_funds
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmwasm.wasm.v1.MsgExecuteContract',
      value: message.cosmwasm.wasm.v1.MsgExecuteContract.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny]
    });

    try {
      const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', undefined, undefined, undefined, true);
      console.log(response);
    } catch (ex) {
      console.log(ex);
    }
  });
});
