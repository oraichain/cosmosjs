import yargs from 'yargs/yargs';
import { Cosmos } from '../src/index.js';
import message from '../src/messages/proto';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const argv = yargs(process.argv)
    .command('stake', 'stake orai token')
    .option('chain-id', {
        type: 'string',
        default: 'Oraichain'
    })
    .option('mnemonic', {
        type: 'string'
    })
    .option('url', {
        default: 'http://3.139.240.126:1317',
        type: 'string'
    })
    .option('to', {
        type: 'string',
        default: 'orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg'
    })
    .option('amount', {
        default: 10,
        type: 'number'
    }).argv;

const chainId = argv.chainId;
const cosmos = new Cosmos(argv.url, chainId);
const prefix = 'orai';
const listSendMnemonic = process.env.LIST_SEND_MNEMONIC.split(",") || ["buddy carpet correct lizard blue mushroom peasant athlete saddle brisk sense black hold hat quantum drama come sight frequent help youth process faculty spy"];
console.log(listSendMnemonic)
const validators = process.env.LIST_VALIDATORS.split(",") || ["oraivaloper1lwsq3768lunk78wdsj836svlfpfs09m3mre3wk"];

for (let index = 0; index < listSendMnemonic.length; index++) {
    const mnemonic =
        argv.mnemonic || listSendMnemonic[index];
    cosmos.setBech32MainPrefix(prefix);
    const address = cosmos.getAddress(mnemonic);
    const validator_address = validators[index];
    const amount = 1

    console.log("address: ", address)

    const privKey = cosmos.getECPairPriv(mnemonic);
    const pubKeyAny = cosmos.getPubKeyAny(privKey);

    cosmos.getAccounts(address).then((data) => {
        const msgStaking = new message.cosmos.staking.v1beta1.MsgDelegate({
            delegator_address: address,
            validator_address: validator_address,
            amount: { denom: prefix, amount: String(amount) } // 10
        });

        const msgStakingAny = new message.google.protobuf.Any({
            type_url: '/cosmos.staking.v1beta1.MsgDelegate',
            value: message.cosmos.staking.v1beta1.MsgDelegate.encode(msgStaking).finish()
        });

        const txBody = new message.cosmos.tx.v1beta1.TxBody({
            messages: [msgStakingAny],
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
        //cosmos.broadcast(signedTxBytes).then((response) => console.log(response));
    });
}