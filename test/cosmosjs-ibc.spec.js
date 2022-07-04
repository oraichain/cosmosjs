import dotenv from 'dotenv';
import assert from 'assert';
import Cosmos from '../src';
import Long from 'long';

dotenv.config();

const cosmos = new Cosmos('https://lcd.orai.io', 'Oraichain');
cosmos.setBech32MainPrefix('orai');

describe('cosmosjs-ibc', () => {
  it('should broadcast successfully', async () => {
    const message = Cosmos.message;
    const childKey = cosmos.getChildKey(process.env.SEND_MNEMONIC);
    const sender = cosmos.getAddress(childKey);

    const msgSend = new message.ibc.applications.transfer.v1.MsgTransfer({
      source_channel: 'channel-15',
      source_port: 'transfer',
      sender,
      receiver: 'cosmos14n3tx8s5ftzhlxvq0w5962v60vd82h30sythlz',
      token: { denom: 'ibc/A2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78', amount: '1' },
      timeout_timestamp: Long.fromString('1756918167000000000', true),
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/ibc.applications.transfer.v1.MsgTransfer',
      value: message.ibc.applications.transfer.v1.MsgTransfer.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo: ''
    });

    try {
      const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', undefined, undefined, undefined, true);
      console.log(response);
    } catch (ex) {
      console.log(ex);
    }
  });
});
