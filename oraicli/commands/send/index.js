import { Cosmos } from '../../../src/index.js';
import message from '../../../src/messages/proto';

export default async (argv) => {
  const cosmos = new Cosmos(argv.url, argv.chainId);
  const prefix = 'orai';
  cosmos.setBech32MainPrefix(prefix);
  const address = cosmos.getAddress(argv.mnemonic);
  const privKey = cosmos.getECPairPriv(argv.mnemonic);
  const pubKeyAny = cosmos.getPubKeyAny(privKey);

  const data = await cosmos.getAccounts(address);
  const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
    from_address: address,
    to_address: argv.address,
    amount: [{ denom: prefix, amount: String(argv.amount || 10) }] // 10
  });

  const msgSendAny = new message.google.protobuf.Any({
    type_url: '/cosmos.bank.v1beta1.MsgSend',
    value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
  });

  const txBody = new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny],
    memo: ''
  });

  // --------------------------------- (2)authInfo ---------------------------------
  const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
    public_key: pubKeyAny,
    mode_info: {
      single: {
        mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT
      }
    },
    sequence: data.account.sequence
  });

  const feeValue = new message.cosmos.tx.v1beta1.Fee({
    gas_limit: 200000
  });

  const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({
    signer_infos: [signerInfo],
    fee: feeValue
  });

  const signedTxBytes = cosmos.sign(
    txBody,
    authInfo,
    data.account.account_number,
    privKey
  );
  const response = await cosmos.broadcast(signedTxBytes);
  console.log(response);
};
