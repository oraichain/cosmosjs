import { Argv } from 'yargs';
import fs from 'fs';
import { Cosmos } from '../../../../src';
import message from '../../../../src/messages/proto';

const getStoreMessage = (wasm_byte_code, sender) => {
  const msgSend = new message.cosmwasm.wasm.v1beta1.MsgStoreCode({
    wasm_byte_code,
    sender
  });

  const msgSendAny = new message.google.protobuf.Any({
    type_url: '/cosmwasm.wasm.v1beta1.MsgStoreCode',
    value: message.cosmwasm.wasm.v1beta1.MsgStoreCode.encode(msgSend).finish()
  });

  return new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny]
  });
};

const getInstantiateMessage = (code_id, init_msg, sender, label = '') => {
  const msgSend = new message.cosmwasm.wasm.v1beta1.MsgInstantiateContract({
    code_id,
    init_msg,
    label,
    sender
  });

  const msgSendAny = new message.google.protobuf.Any({
    type_url: '/cosmwasm.wasm.v1beta1.MsgInstantiateContract',
    value: message.cosmwasm.wasm.v1beta1.MsgInstantiateContract.encode(msgSend).finish()
  });

  return new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny]
  });
};

export default async (yargs: Argv) => {
  const { argv } = yargs
    .positional('file', {
      describe: 'the smart contract file',
      type: 'string'
    })
    .option('label', {
      describe: 'the label of smart contract',
      type: 'string'
    })
    .option('input', {
      describe: 'the input to initilize smart contract',
      default: '{}',
      type: 'string'
    });
  const [file] = argv._.slice(-1);

  const cosmos = new Cosmos(argv.url, argv.chainId);

  cosmos.setBech32MainPrefix('orai');
  const childKey = cosmos.getChildKey(argv.mnemonic);
  const sender = cosmos.getAddress(childKey);

  const wasmBody = fs.readFileSync(file).toString('base64');

  const txBody1 = getStoreMessage(wasmBody, sender);

  const res1 = await cosmos.submit(childKey, txBody1, 'BROADCAST_MODE_BLOCK', 1000000);

  if (res1.tx_response.code !== 0) return;

  // next instantiate code
  const codeId = res1.tx_response.logs[0].events[0].attributes.find((attr) => attr.key === 'code_id').value;
  const input = Buffer.from(argv.input).toString('base64');
  const txBody2 = getInstantiateMessage(codeId, input, sender, argv.label);
  const res2 = await cosmos.submit(childKey, txBody2, 'BROADCAST_MODE_BLOCK');

  console.log(res2);
};
