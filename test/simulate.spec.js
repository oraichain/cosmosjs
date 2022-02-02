import dotenv from 'dotenv';
import assert from 'assert';
import Cosmos from '../src';

dotenv.config();

const cosmos = new Cosmos('https://testnet.lcd.orai.io', 'Oraichain-testnet');
cosmos.setBech32MainPrefix('orai');

describe('simulate', () => {
  it('should return gas estimation correctly', async () => {
    const message = Cosmos.message;
    const childKey = cosmos.getChildKey(process.env.SEND_MNEMONIC);
    const address = cosmos.getAddress(childKey);
    console.log('from: ', address);

    const msgSendAny = {
      "@type": '/cosmos.bank.v1beta1.MsgSend',
      from_address: cosmos.getAddress(childKey),
      to_address: 'orai123rm6nkcuwgnsr7grdg0cpkpvchx9xsa8l7x7d',
      amount: [{ denom: cosmos.bech32MainPrefix, amount: '10' }] // 10
    };

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo: 'simulate'
    });

    try {
      const response = await cosmos.simulate(childKey.publicKey, txBody);
      console.log(response);
    } catch (ex) {
      console.log(ex);
    }
  });
});
