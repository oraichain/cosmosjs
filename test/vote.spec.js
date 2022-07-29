import dotenv from 'dotenv';
import assert from 'assert';
import Cosmos from '../src';

dotenv.config();

const cosmos = new Cosmos('https://lcd.orai.io', 'Oraichain');
cosmos.setBech32MainPrefix('orai');

describe('vote', () => {
  it('should broadcast successfully', async () => {
    const message = Cosmos.message;
    const childKey = cosmos.getChildKey(process.env.SEND_MNEMONIC);
    const address = cosmos.getAddress(childKey);
    console.log('from: ', address);

    const msgSend = new message.cosmos.gov.v1beta1.MsgVote({
      proposal_id: Number(98),
      voter: address,
      option: 1
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.gov.v1beta1.MsgVote',
      value: message.cosmos.gov.v1beta1.MsgVote.encode(msgSend).finish(),
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo: 'submit'
    });

    try {
      const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', undefined, undefined, undefined, true);
      console.log(response);
    } catch (ex) {
      console.log(ex);
    }
  });
});
