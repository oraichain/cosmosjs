import yargs from 'yargs/yargs';
import { Cosmos } from './src/index.js';
import message from './src/messages/proto';

const argv = yargs(process.argv)
  .command('send', 'send orai token')
  .option('chain-id', {
    type: 'string',
    default: 'Oraichain'
  })
  .option('mnemonic', {
    type: 'string'
  })
  .option('url', {
    default: 'http://localhost:1317',
    type: 'string'
  })
  .option('to', {
    type: 'string',
    default: 'orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n'
  })
  .option('amount', {
    default: 10,
    type: 'number'
  }).argv;

const chainId = argv.chainId;
const cosmos = new Cosmos(argv.url, chainId);
const prefix = 'orai';
const mnemonic =
  argv.mnemonic ||
  'best voice endless similar spell destroy brown accident news round dream wrap vote guilt merry satoshi produce despair merit fence oval ball notice mesh';
cosmos.setBech32MainPrefix(prefix);
const address = cosmos.getAddress(mnemonic);

const privKey = cosmos.getECPairPriv(mnemonic);
const pubKeyAny = cosmos.getPubKeyAny(privKey);

cosmos.getAccounts(address).then((data) => {
  const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
    from_address: address,
    to_address: argv.to,
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
  cosmos.broadcast(signedTxBytes).then((response) => console.log(response));
});
