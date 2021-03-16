import { Argv } from 'yargs';
import bech32 from 'bech32';
import { Cosmos } from '../../../../src/index.js';
import message from '../../../../src/messages/proto';
import KSUID from 'ksuid';
import Long from 'long';

export default async (yargs: Argv) => {
    const { argv } = yargs
        .positional('oscript-name', {
            describe: 'the oracle script name',
            type: 'string'
        })
        .positional('validator-count', {
            describe: 'the number of validators',
            type: 'string'
        })

    const req_id = KSUID.randomSync().string;

    const cosmos = new Cosmos(argv.url, argv.chainId);
    cosmos.setBech32MainPrefix('orai');
    const childKey = cosmos.getChildKey(argv.mnemonic);

    const [oscriptName, count] = argv._.slice(-2);
    const { input, expectedOutput } = argv;
    // get accAddress in binary
    const accAddress = bech32.fromWords(bech32.toWords(childKey.identifier));
    const msgSend = new message.oraichain.orai.airequest.MsgSetAIRequest({
        request_id: req_id,
        oracle_script_name: oscriptName,
        creator: accAddress,
        validator_count: new Long(count),
        fees: '',
        input: Buffer.from(input),
        expected_output: Buffer.from(expectedOutput)
    });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/oraichain.orai.airequest.MsgSetAIRequest',
        value: message.oraichain.orai.airequest.MsgSetAIRequest.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo: 'set-aireq'
    });

    try {
        const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK');
        console.log(response);
        console.log("request id: ", req_id)
        const data = await fetch(`${argv.url}/airesult/fullreq/${req_id}`).then((res) => res.json());
        console.log("request full information: ", data)
    } catch (ex) {
        console.log(ex);
    }
};