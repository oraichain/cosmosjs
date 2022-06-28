import dotenv from 'dotenv';
import assert from 'assert';
import Cosmos from '../src';

dotenv.config();

const cosmos = new Cosmos('https://testnet.lcd.orai.io', 'Oraichain-testnet');
cosmos.setBech32MainPrefix('orai');

describe('submit', () => {
  it('should broadcast successfully', async () => {
    const message = Cosmos.message;
    const childKey = cosmos.getChildKey(process.env.SEND_MNEMONIC);
    const address = cosmos.getAddress(childKey);
    console.log('from: ', address);

    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: 'foobar',
      to_address: 'foobar',
      amount: [{ denom: 'foobar', amount: '0' }] // 10
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgSend',
      value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish(),
      value_raw: msgSend
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo: 'submit'
    });

    try {
      const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK');
      console.log(response);
    } catch (ex) {
      console.log(ex);
    }
  });
});
