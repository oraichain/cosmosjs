import { Argv } from 'yargs';

import { Cosmos } from '../../../../src';
import message from '../../../../src/messages/proto';

const getHandleMessage = (contract, msg, sender) => {
  const msgSend = new message.cosmwasm.wasm.v1beta1.MsgExecuteContract({
    contract,
    msg,
    sender
  });

  const msgSendAny = new message.google.protobuf.Any({
    type_url: '/cosmwasm.wasm.v1beta1.MsgExecuteContract',
    value: message.cosmwasm.wasm.v1beta1.MsgExecuteContract.encode(msgSend).finish()
  });

  return new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny]
  });
};

export default async (yargs: Argv) => {
  const { argv } = yargs.positional('address', {
    describe: 'the smart contract address',
    type: 'string'
  });
  const [address] = argv._.slice(-1);

  const cosmos = new Cosmos(argv.url, argv.chainId);

  cosmos.setBech32MainPrefix('orai');
  const childKey = cosmos.getChildKey(argv.mnemonic);
  const sender = cosmos.getAddress(childKey);

  const input = Buffer.from(argv.input).toString('base64');

  const txBody = getHandleMessage(address, input, sender);
  const res = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', isNaN(argv.fees) ? 0 : parseInt(argv.fees));

  console.log(res);
};
