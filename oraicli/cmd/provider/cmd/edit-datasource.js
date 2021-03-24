import { Argv } from 'yargs';
import bech32 from 'bech32';
import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';

export default async (yargs: Argv) => {
    const { argv } = yargs
        .positional('oldName', {
            describe: 'the old datasource name',
            type: 'string'
        })
        .positional('newName', {
            describe: 'the new datasource name',
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

    const [oldName, newName, description, contractAddress] = argv._.slice(-4);
    console.log("argv: ", argv._.slice(-4))
    // get accAddress in binary
    const accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
    const msgSend = new message.oraichain.orai.provider.MsgEditAIDataSource({
        old_name: oldName,
        new_name: newName,
        description: description,
        contract: contractAddress,
        owner: accAddress
    });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/oraichain.orai.provider.MsgEditAIDataSource',
        value: message.oraichain.orai.provider.MsgEditAIDataSource.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo: 'edit-datasource'
    });

    try {
        const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', isNaN(argv.fees) ? 0 : parseInt(argv.fees));
        console.log(response);
    } catch (ex) {
        console.log(ex);
    }
};


// yarn oraicli provider edit-datasource classification classification "test edit data source" orai1myee9usysamhfv5nffjs6vvv3zfn2kuy8xamhx