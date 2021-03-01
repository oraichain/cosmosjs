import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';

export default async (argv) => {
  const cosmos = new Cosmos(argv.url, argv.chainId);
  cosmos.setBech32MainPrefix('orai');
  const childKey = cosmos.getChildKey(argv.mnemonic);

  const [name, contractAddress, description] = argv._;

  const msgSend = new message.oraichain.orai.provider.MsgCreateAIDataSource({
    name,
    description,
    contract: contractAddress,
    owner: cosmos.getAddress(childKey)
  });

  const msgSendAny = new message.google.protobuf.Any({
    type_url: '/oraichain.orai.provider.Msg/CreateAIDataSource',
    value: message.oraichain.orai.provider.MsgCreateAIDataSource.encode(
      msgSend
    ).finish()
  });

  const txBody = new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny],
    memo: 'set-datasource'
  });

  const response = await cosmos.submit(childKey, txBody);
  console.log(response);
};
