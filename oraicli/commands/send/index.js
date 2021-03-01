import { Cosmos } from '../../../src/index.js';
import message from '../../../src/messages/proto';

export default async (argv) => {
  const cosmos = new Cosmos(argv.url, argv.chainId);
  cosmos.setBech32MainPrefix('orai');
  const childKey = cosmos.getChildKey(argv.mnemonic);

  const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
    from_address: cosmos.getAddress(childKey),
    to_address: argv.address,
    amount: [{ denom: cosmos.bech32MainPrefix, amount: argv.amount }] // 10
  });

  const msgSendAny = new message.google.protobuf.Any({
    type_url: '/cosmos.bank.v1beta1.MsgSend',
    value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
  });

  const txBody = new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny],
    memo: ''
  });

  const response = await cosmos.submit(childKey, txBody);

  console.log(response);
};
