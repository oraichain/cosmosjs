import { Argv } from 'yargs';
import bech32 from 'bech32';
import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';

export default async (yargs: Argv) => {
  const { argv } = yargs
    .positional('name', {
      describe: 'the datasource name',
      type: 'string'
    })
    .positional('description', {
      describe: 'the datasource description',
      type: 'string'
    })
    .positional('contract', {
      describe: 'the datasource contract address',
      type: 'string'
    })
    .option('fees', {
      describe: 'the transaction fees',
      type: 'string'
    });

  const cosmos = new Cosmos(argv.url, argv.chainId);
  cosmos.setBech32MainPrefix('orai');
  const childKey = cosmos.getChildKey(argv.mnemonic);

  const [name, description, contractAddress] = argv._.slice(-3);
  const { fees } = argv;
  // get accAddress in binary
  const accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
  const msgSend = new message.oraichain.orai.provider.MsgCreateAIDataSource({
    name,
    description,
    contract: contractAddress,
    owner: accAddress,
    fees: fees === "" ? "0orai" : fees,
  });

  const msgSendAny = new message.google.protobuf.Any({
    type_url: '/oraichain.orai.provider.MsgCreateAIDataSource',
    value: message.oraichain.orai.provider.MsgCreateAIDataSource.encode(msgSend).finish()
  });

  const txBody = new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny],
    memo: 'set-datasource'
  });

  try {
    const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', isNaN(argv.fees) ? 0 : parseInt(argv.fees));
    console.log(response);
  } catch (ex) {
    console.log(ex);
  }
};

// yarn oraicli provider set-datasource cv009 "test cv009" orai17ak0ku2uvfs04w4u867xhgvfg4ta6mgqu79cf0