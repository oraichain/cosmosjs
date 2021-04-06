import { Argv } from 'yargs';
import bech32 from 'bech32';
import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';

export default async (yargs: Argv) => {
    const { argv } = yargs
        .positional('name', {
            describe: 'the oracle script name',
            type: 'string'
        })
        .positional('description', {
            describe: 'the oracle script description',
            type: 'string'
        })
        .positional('contract', {
            describe: 'the oracle script contract address',
            type: 'string'
        })
        .option('ds', {
            describe: 'data source names',
            type: 'array'
        })
        .option('tc', {
            describe: 'test case names',
            type: 'array'
        })
        .option('fees', {
            describe: 'the transaction fees',
            type: 'string'
        });

    const cosmos = new Cosmos(argv.url, argv.chainId);
    cosmos.setBech32MainPrefix('orai');
    const childKey = cosmos.getChildKey(argv.mnemonic);

    const [name, description, contractAddress] = argv._.slice(-3);
    const { ds, tc, fees } = argv;
    // get accAddress in binary
    console.log("data sources: ", ds)
    const accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
    const msgSend = new message.oraichain.orai.provider.MsgCreateOracleScript({
        name,
        description,
        contract: contractAddress,
        owner: accAddress,
        data_sources: ds,
        test_cases: tc,
        fees: fees === "" ? "0orai" : fees,
    });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/oraichain.orai.provider.MsgCreateOracleScript',
        value: message.oraichain.orai.provider.MsgCreateOracleScript.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo: 'set-oscript'
    });

    try {
        const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', isNaN(argv.fees) ? 0 : parseInt(argv.fees));
        console.log(response);
    } catch (ex) {
        console.log(ex);
    }
};


// yarn oraicli provider set-oscript classification_oscript_2 "test oscript" orai1myee9usysamhfv5nffjs6vvv3zfn2kuy8xamhx --ds classification cv009 --tc classification_testcase