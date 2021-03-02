import { Argv } from 'yargs';
import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';
import totalRewards from './get-total-rewards';

export default async (yargs: Argv) => {
  const { argv } = yargs
    .option('sendAddresses', {
      describe: 'addresses that have staked into the validators',
      type: 'array',
      default: process.env.LIST_SEND_ADDRESSES.split(',') || [
        'orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg'
      ]
    })
    .option('validators', {
      describe: 'list of validators we want to check',
      type: 'array',
      default: process.env.LIST_VALIDATORS.split(',') || [
        'oraivaloper1lwsq3768lunk78wdsj836svlfpfs09m3mre3wk'
      ]
    })
    .option('receiveAddresses', {
      describe: 'addresses that will receive the rewards',
      type: 'array',
      default: process.env.LIST_RECEIVE_ADDRESSES.split(',') || [
        'orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg'
      ]
    })
    .option('mnemonics', {
      describe: 'mnemonics of addresses that will send the rewards',
      type: 'array',
      default: process.env.LIST_SEND_MNEMONIC.split(',') || [
        'survey maze spatial profit narrow memory drop load assist produce exact leaf unique adult token idea mammal cradle catch salmon blade term rubber else'
      ]
    });

  const cosmos = new Cosmos(argv.url, argv.chainId);
  cosmos.setBech32MainPrefix('orai');
  const results = await totalRewards(argv);
  const tempRewards = [
    3.456,
    3.456,
    1.728,
    22.464,
    15.552,
    8.64,
    10.368,
    8.64,
    5.184,
    3.456,
    3.456,
    1.728,
    1.728,
    1.728
  ];
  const { receiveAddresses, mnemonics } = argv;

  console.log('receive addresses: ', receiveAddresses);

  for (let index = 0; index < receiveAddresses.length; index++) {
    const receiveAddress = receiveAddresses[index];
    const childKey = cosmos.getChildKey(mnemonics[index]);

    cosmos.getAddress(childKey);

    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: cosmos.getAddress(childKey),
      to_address: receiveAddress,
      amount: [
        {
          denom: cosmos.bech32MainPrefix,
          amount: String(results[index] || 0.001)
        }
      ] // 10
    });

    console.log(msgSend);

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgSend',
      value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo: ''
    });

    //const response = await cosmos.submit(childKey, txBody);
  }
};
