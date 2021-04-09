import message from 'cosmosjs/messages/proto';
import Big from 'big.js';

export const getTxBodySend = (user, to_address, amount, memo) => {
    const cosmos = window.cosmos;
    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
        from_address: user.address,
        to_address,
        amount: [{ denom: cosmos.bech32MainPrefix, amount }] // 10
    });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/cosmos.bank.v1beta1.MsgSend',
        value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo
    });
};

export const getTxBodyMultiSend = (user, msgs, memo) => {
    const cosmos = window.cosmos;
    let senderAmount = new Big(0);

    const outputs = msgs.map((msg) => {
        const { amount } = msg.value.amount[0];
        senderAmount = senderAmount.plus(amount);
        return {
            address: msg.value.to_address,
            coins: [{ denom: cosmos.bech32MainPrefix, amount: amount.toString() }],
        };
    });

    const msgSend = new message.cosmos.bank.v1beta1.MsgMultiSend({
        inputs: [{
            address: user.address,
            coins: [{ denom: cosmos.bech32MainPrefix, amount: senderAmount.toString() }]
        }],
        outputs,
    });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/cosmos.bank.v1beta1.MsgMultiSend',
        value: message.cosmos.bank.v1beta1.MsgMultiSend.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo
    });
};

export const getTxBodyDelegate = (user, validator_address, amount, memo) => {
    const cosmos = window.cosmos;
    const msgSend = new message.cosmos.staking.v1beta1.MsgDelegate({
        delegator_address: user.address,
        validator_address,
        amount: { denom: cosmos.bech32MainPrefix, amount } // 10
    });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/cosmos.staking.v1beta1.MsgDelegate',
        value: message.cosmos.staking.v1beta1.MsgDelegate.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo
    });
};

export const getTxCreateValidator = (msg) => {
    const msgSend = new message.cosmos.staking.v1beta1.MsgCreateValidator({
        ...msg,
        pubkey: {
            type_url: '/cosmos.crypto.ed25519.PubKey',
            value: msg.pubkey,
        }
    });

    // const msgSend = new message.cosmos.staking.v1beta1.MsgCreateValidator({
    //     "description": {
    //         "moniker": "test",
    //         "identity": "",
    //         "website": "",
    //         "security_contact": "",
    //         "details": ""
    //     },
    //     "commission": {
    //         "rate": "10",
    //         "max_rate": "30",
    //         "max_change_rate": "25"
    //     },
    //     "min_self_delegation": "1",
    //     "delegator_address": "orai12yxu6j9lp42y9qeyq4dxyu03f8887aa2d4l6hd ",
    //     "validator_address": "oraivaloper12yxu6j9lp42y9qeyq4dxyu03f8887aa2ylynu2",
    //     "pubkey": {
    //         "type_url": "/cosmos.crypto.ed25519.PubKey",
    //         "key": "siQWScAVIK3sxGjk7LKrFXNtKnwMN95i6kmnzL/4m74="
    //     },
    //     "value": {
    //         "denom": "orai",
    //         "amount": "1"
    //     }
    // });

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/cosmos.staking.v1beta1.MsgCreateValidator',
        value: message.cosmos.staking.v1beta1.MsgCreateValidator.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny],
        memo: '',
    });
};