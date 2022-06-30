import message from './proto';

function createDefaultTypes(prefix) {
    return {
        "/cosmos.bank.v1beta1.MsgSend": {
            aminoType: "cosmos-sdk/MsgSend",
            toAmino: (msgSendAny) => {
                const msgSend = message.cosmos.bank.v1beta1.MsgSend.decode(msgSendAny);
                return {
                    amount: [...msgSend.amount],
                    from_address: msgSend.from_address,
                    to_address: msgSend.to_address,
                }
            },
            fromAmino: ({ from_address, to_address, amount }) => ({
                fromAddress: from_address,
                toAddress: to_address,
                amount: [...amount],
            }),
        },
        // "/cosmos.bank.v1beta1.MsgMultiSend": {
        //     aminoType: "cosmos-sdk/MsgMultiSend",
        //     toAmino: ({ inputs, outputs }) => ({
        //         inputs: inputs.map((input) => ({
        //             address: input.address,
        //             coins: [...input.coins],
        //         })),
        //         outputs: outputs.map((output) => ({
        //             address: output.address,
        //             coins: [...output.coins],
        //         })),
        //     }),
        //     fromAmino: ({ inputs, outputs }) => ({
        //         inputs: inputs.map((input) => ({
        //             address: input.address,
        //             coins: [...input.coins],
        //         })),
        //         outputs: outputs.map((output) => ({
        //             address: output.address,
        //             coins: [...output.coins],
        //         })),
        //     }),
        // },
        // "/cosmos.distribution.v1beta1.MsgFundCommunityPool": {
        //     aminoType: "cosmos-sdk/MsgFundCommunityPool",
        //     toAmino: ({ amount, depositor }) => ({
        //         amount: [...amount],
        //         depositor: depositor,
        //     }),
        //     fromAmino: ({ amount, depositor }) => ({
        //         amount: [...amount],
        //         depositor: depositor,
        //     }),
        // },
        // "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress": {
        //     aminoType: "cosmos-sdk/MsgModifyWithdrawAddress",
        //     toAmino: ({ delegatorAddress, withdrawAddress, }) => ({
        //         delegator_address: delegatorAddress,
        //         withdraw_address: withdrawAddress,
        //     }),
        //     fromAmino: ({ delegator_address, withdraw_address, }) => ({
        //         delegatorAddress: delegator_address,
        //         withdrawAddress: withdraw_address,
        //     }),
        // },
        // "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
        //     aminoType: "cosmos-sdk/MsgWithdrawDelegationReward",
        //     toAmino: ({ delegatorAddress, validatorAddress, }) => ({
        //         delegator_address: delegatorAddress,
        //         validator_address: validatorAddress,
        //     }),
        //     fromAmino: ({ delegator_address, validator_address, }) => ({
        //         delegatorAddress: delegator_address,
        //         validatorAddress: validator_address,
        //     }),
        // },
        // "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission": {
        //     aminoType: "cosmos-sdk/MsgWithdrawValidatorCommission",
        //     toAmino: ({ validatorAddress, }) => ({
        //         validator_address: validatorAddress,
        //     }),
        //     fromAmino: ({ validator_address, }) => ({
        //         validatorAddress: validator_address,
        //     }),
        // },
        // "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
        //     aminoType: "cosmos-sdk/MsgBeginRedelegate",
        //     toAmino: ({ delegatorAddress, validatorSrcAddress, validatorDstAddress, amount, }) => {
        //         utils_1.assertDefinedAndNotNull(amount, "missing amount");
        //         return {
        //             delegator_address: delegatorAddress,
        //             validator_src_address: validatorSrcAddress,
        //             validator_dst_address: validatorDstAddress,
        //             amount: amount,
        //         };
        //     },
        //     fromAmino: ({ delegator_address, validator_src_address, validator_dst_address, amount, }) => ({
        //         delegatorAddress: delegator_address,
        //         validatorSrcAddress: validator_src_address,
        //         validatorDstAddress: validator_dst_address,
        //         amount: amount,
        //     }),
        // },
        // "/cosmos.staking.v1beta1.MsgDelegate": {
        //     aminoType: "cosmos-sdk/MsgDelegate",
        //     toAmino: ({ delegatorAddress, validatorAddress, amount }) => {
        //         utils_1.assertDefinedAndNotNull(amount, "missing amount");
        //         return {
        //             delegator_address: delegatorAddress,
        //             validator_address: validatorAddress,
        //             amount: amount,
        //         };
        //     },
        //     fromAmino: ({ delegator_address, validator_address, amount, }) => ({
        //         delegatorAddress: delegator_address,
        //         validatorAddress: validator_address,
        //         amount: amount,
        //     }),
        // },
        // "/cosmos.staking.v1beta1.MsgUndelegate": {
        //     aminoType: "cosmos-sdk/MsgUndelegate",
        //     toAmino: ({ delegatorAddress, validatorAddress, amount, }) => {
        //         utils_1.assertDefinedAndNotNull(amount, "missing amount");
        //         return {
        //             delegator_address: delegatorAddress,
        //             validator_address: validatorAddress,
        //             amount: amount,
        //         };
        //     },
        //     fromAmino: ({ delegator_address, validator_address, amount, }) => ({
        //         delegatorAddress: delegator_address,
        //         validatorAddress: validator_address,
        //         amount: amount,
        //     }),
        // },
        // "/ibc.applications.transfer.v1.MsgTransfer": {
        //     aminoType: "cosmos-sdk/MsgTransfer",
        //     toAmino: ({ sourcePort, sourceChannel, token, sender, receiver, timeoutHeight, timeoutTimestamp, }) => {
        //         var _a, _b, _c;
        //         return ({
        //             source_port: sourcePort,
        //             source_channel: sourceChannel,
        //             token: token,
        //             sender: sender,
        //             receiver: receiver,
        //             timeout_height: timeoutHeight
        //                 ? {
        //                     revision_height: (_a = omitDefault(timeoutHeight.revisionHeight)) === null || _a === void 0 ? void 0 : _a.toString(),
        //                     revision_number: (_b = omitDefault(timeoutHeight.revisionNumber)) === null || _b === void 0 ? void 0 : _b.toString(),
        //                 }
        //                 : {},
        //             timeout_timestamp: (_c = omitDefault(timeoutTimestamp)) === null || _c === void 0 ? void 0 : _c.toString(),
        //         });
        //     },
        //     fromAmino: ({ source_port, source_channel, token, sender, receiver, timeout_height, timeout_timestamp, }) => ({
        //         sourcePort: source_port,
        //         sourceChannel: source_channel,
        //         token: token,
        //         sender: sender,
        //         receiver: receiver,
        //         timeoutHeight: timeout_height
        //             ? {
        //                 revisionHeight: long_1.default.fromString(timeout_height.revision_height || "0", true),
        //                 revisionNumber: long_1.default.fromString(timeout_height.revision_number || "0", true),
        //             }
        //             : undefined,
        //         timeoutTimestamp: long_1.default.fromString(timeout_timestamp || "0", true),
        //     }),
        // },
    };
}

export default class AminoTypes {
    constructor({ additions = {}, prefix = "orai" } = {}) {
        const additionalAminoTypes = Object.values(additions);
        const filteredDefaultTypes = Object.entries(createDefaultTypes(prefix)).reduce((acc, [key, value]) => additionalAminoTypes.find(({ aminoType }) => value.aminoType === aminoType)
            ? acc
            : Object.assign(Object.assign({}, acc), { [key]: value }), {});
        this.register = Object.assign(Object.assign({}, filteredDefaultTypes), additions);
    }
    toAmino({ type_url, value }) {
        const converter = this.register[type_url];
        console.log("converter: ", converter)
        if (!converter) {
            throw new Error("Type URL does not exist in the Amino message type register. " +
                "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
                "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.");
        }
        return {
            type: converter.aminoType,
            value: converter.toAmino(value),
        };
    }
    fromAmino({ type, value }) {
        const result = Object.entries(this.register).find(([_typeUrl, { aminoType }]) => aminoType === type);
        if (!result) {
            throw new Error("Type does not exist in the Amino message type register. " +
                "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
                "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.");
        }
        const [type_url, converter] = result;
        return {
            type_url: type_url,
            value: converter.fromAmino(value),
        };
    }
}