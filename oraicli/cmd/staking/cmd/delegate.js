import { Argv } from 'yargs';
import { Cosmos } from '../../../../src';
import message from '../../../../src/messages/proto';
import bech32 from 'bech32';

export default async (yargs: Argv) => {
    const { argv } = yargs;
    const cosmos = new Cosmos(argv.url, argv.chainId);
    cosmos.setBech32MainPrefix('orai');
    const sender = cosmos.getAddress(argv.mnemonic);
    const childKey = cosmos.getChildKey(argv.mnemonic);
    const delegator = cosmos.getAddress(argv.mnemonic);
    const { address, amount } = argv;
    const msgDelegate = new message.cosmos.staking.v1beta1.MsgDelegate({
        delegator_address: delegator,
        validator_address: address,
        amount: { denom: cosmos.bech32MainPrefix, amount: amount.toString() }
    });

    console.log("msg delegate: ", msgDelegate)

    const msgDelegateAny = new message.google.protobuf.Any({
        type_url: '/cosmos.staking.v1beta1.MsgDelegate',
        value: message.cosmos.staking.v1beta1.MsgDelegate.encode(msgDelegate).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgDelegateAny],
        memo: ''
    });

    try {
        const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', isNaN(argv.fees) ? 0 : parseInt(argv.fees));
        console.log(response);
    } catch (ex) {
        console.log(ex);
    }
};

// yarn oraicli multisend 40 --receivers orai14ruagqc8ta5v452207t6n9cyautyjnzl39hrjh orai1nayufsvk9fdwfz5k9ytacl62uf28s4puaz67h8 orai1t5g84uyusz9d8jrpfql99ptg8l75ck3l8rrvd4 --receiver-amounts 10 10 20