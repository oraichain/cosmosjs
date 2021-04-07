import { Argv } from 'yargs';
import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';
import totalRewards from './get-total-rewards';
import dotenv from "dotenv";
import xlsx from 'xlsx';
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

function calculateTotalRewards(sheet) {
  let total = 0.0;
  for (let j = 1; sheet['B' + j.toString()] !== undefined; j++) {
    let amount = parseFloat(sheet['B' + j.toString()].v) / 1000;
    total += amount;
  }
  return total;
}

export default async (yargs: Argv) => {
  const { argv } = yargs
    .option('mnemonics', {
      describe: '',
      type: 'array',
      default: process.env.LIST_SEND_MNEMONIC.split(',') || [
        'orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg'
      ]
    })
    .option('rewardFile', {
      describe: '',
      type: 'string',
      default: 'reward.xlsx'
    })

  const finalReceiveObject = {};

  const cosmos = new Cosmos(argv.url, argv.chainId);
  cosmos.setBech32MainPrefix('orai');
  const { mnemonics, rewardFile } = argv;
  const book = xlsx.readFile(__dirname + '/' + rewardFile)

  console.log("book sheet name: ", book.Props.SheetNames)
  for (let i = 0; i < book.SheetNames.length; i++) {
    let sheet = book.Sheets[book.SheetNames[i]];
    let outputs = [];
    let total = 0.0;
    // j = 2 because the first row is reserved for sender address
    for (let j = 1; sheet['A' + j.toString()] !== undefined; j++) {
      let amount = parseFloat(sheet['B' + j.toString()].v) / 1000;
      let output = {
        address: sheet['A' + j.toString()].v,
        coins: [{ denom: cosmos.bech32MainPrefix, amount: amount.toString() }]
      }
      outputs.push(output);
      total += sheet['B' + j.toString()].v;
    }
    finalReceiveObject[book.SheetNames[i]] = outputs
  }
  for (let i = 0; i < book.SheetNames.length; i++) {
    // the first row is reserved for the sender address
    const childKey = cosmos.getChildKey(mnemonics[i]);
    const sender = cosmos.getAddress(childKey);
    console.log("sender: ", sender);
    const totalRewards = calculateTotalRewards(book.Sheets[book.SheetNames[i]]);
    //console.log("total rewards: ", totalRewards)
    // temp reward to test
    const inputs = [{
      address: sender,
      coins: [{ denom: cosmos.bech32MainPrefix, amount: String(totalRewards) }]
    }]

    const outputs = finalReceiveObject[book.SheetNames[i]]

    const msgMultiSend = new message.cosmos.bank.v1beta1.MsgMultiSend({
      inputs: inputs,
      outputs: outputs
    });

    //console.log("msg multisend: ", msgMultiSend)

    const msgMultiSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgMultiSend',
      value: message.cosmos.bank.v1beta1.MsgMultiSend.encode(msgMultiSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgMultiSendAny],
      memo: ''
    });

    // try {
    //   const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', isNaN(argv.fees) ? 0 : parseInt(argv.fees));
    //   console.log(response);
    // } catch (ex) {
    //   console.log(ex);
    // }
  }
};

// yarn oraicli distr send-rewards --rewardFile reward.xlsx