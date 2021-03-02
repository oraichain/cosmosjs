import yargs from 'yargs/yargs';
import { Cosmos } from '../src/index.js';
import message from '../src/messages/proto';
import dotenv from "dotenv";
import rewards from './totalReward';

dotenv.config({ silent: process.env.NODE_ENV === 'production' });

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
    default: `http://${process.env.IP || "localhost"}:1317`,
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

// two following lists will map accordingly to each other. Eg: index 4 in listAddresses will map to index 4 in listMonikers
// test list
// const listReceiveAddresses = ["orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n"];
// const listSendMnemonic = ["buddy carpet correct lizard blue mushroom peasant athlete saddle brisk sense black hold hat quantum drama come sight frequent help youth process faculty spy"];

// real list
const listReceiveAddresses = process.env.LIST_RECEIVE_ADDRESSES.split(",") || ["orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n"];
const listSendMnemonic = process.env.LIST_SEND_MNEMONIC.split(",") || ["buddy carpet correct lizard blue mushroom peasant athlete saddle brisk sense black hold hat quantum drama come sight frequent help youth process faculty spy"];
const listMonikers = process.env.LIST_MONIKERS.split(",") || ["test"];

console.log(listSendMnemonic.length)
console.log(listMonikers.length)
const tempRewards = [3.456, 3.456, 1.728, 22.464, 15.552, 8.64, 10.368, 8.64, 5.184, 3.456, 3.456, 1.728, 1.728, 1.728]

for (let index = 0; index < listReceiveAddresses.length; index++) {
  const receiveAddress = listReceiveAddresses[index];
  const mnemonic = listSendMnemonic[index];

  cosmos.setBech32MainPrefix(prefix);
  const sendAddress = cosmos.getAddress(mnemonic);

  const privKey = cosmos.getECPairPriv(mnemonic);
  const pubKeyAny = cosmos.getPubKeyAny(privKey);

  cosmos.getAccounts(sendAddress).then((data) => {
    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: sendAddress,
      to_address: receiveAddress,
      amount: [{ denom: prefix, amount: String(tempRewards[index] * 1000000 || 0.001) }] // 10
    });

    console.log(msgSend)

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
}
