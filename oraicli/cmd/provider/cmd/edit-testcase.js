import { Argv } from 'yargs';
import bech32 from 'bech32';
import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';

export default async (yargs: Argv) => {
    const { argv } = yargs
        .positional('oldName', {
            describe: 'the old testcase name',
            type: 'string'
        })
        .positional('newName', {
            describe: 'the new testcase name',
            type: 'string'
        })
        .positional('description', {
            describe: 'the testcase description',
            type: 'string'
        })
        .positional('contract', {
            describe: 'the testcase contract address',
            type: 'string'
        })

    const cosmos = new Cosmos(argv.url, argv.chainId);
    cosmos.setBech32MainPrefix('orai');
    const childKey = cosmos.getChildKey(argv.mnemonic);

    const [oldName, newName, description, contractAddress] = argv._.slice(-4);
    console.log("argv: ", argv._.slice(-4))
    // get accAddress in binary
    const accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
    console.log("acc address: ", oldName)
    const msgSend = new message.oraichain.orai.provider.MsgEditTestCase({
        old_name: oldName,
        new_name: newName,
        description: description,
        contract: contractAddress,
        owner: accAddress
    });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/oraichain.orai.provider.MsgEditTestCase',
        value: message.oraichain.orai.provider.MsgEditTestCase.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo: 'edit-testcase'
    });

    try {
        const response = await cosmos.submit(childKey, txBody);
        console.log(response);
    } catch (ex) {
        console.log(ex);
    }
};

// yarn oraicli provider edit-testcase classification classification "test edit test case" orai1myee9usysamhfv5nffjs6vvv3zfn2kuy8xamhx