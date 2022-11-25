import message from './proto';
import Long from 'long';

function createDefaultTypes(prefix) {
  return {
    '/cosmos.bank.v1beta1.MsgSend': {
      aminoType: 'cosmos-sdk/MsgSend',
      toAmino: (msgSendAny) => {
        const msgSend = message.cosmos.bank.v1beta1.MsgSend.decode(msgSendAny);
        return {
          amount: [...msgSend.amount],
          from_address: msgSend.from_address,
          to_address: msgSend.to_address
        };
      },
      fromAmino: ({ from_address, to_address, amount }) => {
        const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
          from_address,
          to_address,
          amount
        });
        return message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish();
      }
    },
    '/cosmos.bank.v1beta1.MsgMultiSend': {
      aminoType: 'cosmos-sdk/MsgMultiSend',
      toAmino: (msgMultisendAny) => {
        const { inputs, outputs } = message.cosmos.bank.v1beta1.MsgMultiSend.decode(msgMultisendAny);
        return {
          inputs,
          outputs
        };
      },
      fromAmino: ({ inputs, outputs }) => {
        const msgMultiSend = new message.cosmos.bank.v1beta1.MsgMultiSend({
          inputs,
          outputs
        });
        return message.cosmos.bank.v1beta1.MsgMultiSend.encode(msgMultiSend).finish();
      }
    },
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
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': {
      aminoType: 'cosmos-sdk/MsgWithdrawDelegationReward',
      toAmino: (msgWithdrawDelegationRewardAny) => {
        const { delegator_address, validator_address } = message.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward.decode(msgWithdrawDelegationRewardAny);
        return {
          delegator_address,
          validator_address
        };
      },
      fromAmino: ({ delegator_address, validator_address }) => {
        const msgWithdraw = new message.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward({ delegator_address, validator_address });
        return message.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward.encode(msgWithdraw).finish();
      }
    },
    '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission': {
      aminoType: 'cosmos-sdk/MsgWithdrawValidatorCommission',
      toAmino: (msgWithdrawValidatorCommission) => {
        const { validator_address } = message.cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission.decode(msgWithdrawValidatorCommission);
        return {
          validator_address
        };
      },
      fromAmino: ({ validator_address }) => {
        const msgWithdraw = new message.cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission({ validator_address });
        return message.cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission.encode(msgWithdraw).finish();
      }
    },
    '/cosmos.staking.v1beta1.MsgBeginRedelegate': {
      aminoType: 'cosmos-sdk/MsgBeginRedelegate',
      toAmino: (msgRedelegateAny) => {
        const msgRedelegate = message.cosmos.staking.v1beta1.MsgBeginRedelegate.decode(msgRedelegateAny);
        return { ...msgRedelegate };
      },
      fromAmino: (data) => {
        const msgRedelegate = new message.cosmos.staking.v1beta1.MsgBeginRedelegate(data);
        return message.cosmos.staking.v1beta1.MsgBeginRedelegate.encode(msgRedelegate).finish();
      }
    },
    '/cosmos.staking.v1beta1.MsgDelegate': {
      aminoType: 'cosmos-sdk/MsgDelegate',
      toAmino: (msgDelegateAny) => {
        const msgDelegate = message.cosmos.staking.v1beta1.MsgDelegate.decode(msgDelegateAny);
        return { ...msgDelegate };
      },
      fromAmino: (data) => {
        const msgDelegate = new message.cosmos.staking.v1beta1.MsgDelegate(data);
        return message.cosmos.staking.v1beta1.MsgDelegate.encode(msgDelegate).finish();
      }
    },
    '/cosmos.staking.v1beta1.MsgUndelegate': {
      aminoType: 'cosmos-sdk/MsgUndelegate',
      toAmino: (msgUndelegateAny) => {
        const msgUndelegate = message.cosmos.staking.v1beta1.MsgUndelegate.decode(msgUndelegateAny);
        return { ...msgUndelegate };
      },
      fromAmino: (data) => {
        const msgUndelegate = new message.cosmos.staking.v1beta1.MsgUndelegate(data);
        return message.cosmos.staking.v1beta1.MsgUndelegate.encode(msgUndelegate).finish();
      }
    },
    '/cosmos.gov.v1beta1.MsgVote': {
      aminoType: 'cosmos-sdk/MsgVote',
      toAmino: (msgVoteAny) => {
        const msgVote = message.cosmos.gov.v1beta1.MsgVote.decode(msgVoteAny);
        return { ...msgVote, proposal_id: msgVote.proposal_id.toString() };
      },
      fromAmino: (data) => {
        const msgVote = new message.cosmos.gov.v1beta1.MsgVote(data);
        return message.cosmos.gov.v1beta1.MsgVote.encode(msgVote).finish();
      }
    },
    '/cosmos.gov.v1beta1.MsgDeposit': {
      aminoType: 'cosmos-sdk/MsgDeposit',
      toAmino: (msgDepositAny) => {
        const msgDeposit = message.cosmos.gov.v1beta1.MsgDeposit.decode(msgDepositAny);
        return { ...msgDeposit, proposal_id: msgDeposit.proposal_id.toString() };
      },
      fromAmino: (data) => {
        const msgDeposit = new message.cosmos.gov.v1beta1.MsgDeposit(data);
        return message.cosmos.gov.v1beta1.MsgDeposit.encode(msgDeposit).finish();
      }
    },
    '/ibc.applications.transfer.v1.MsgTransfer': {
      aminoType: 'cosmos-sdk/MsgTransfer',
      toAmino: (msgTransferAny) => {
        const msgTransfer = message.ibc.applications.transfer.v1.MsgTransfer.decode(msgTransferAny);
        return {
          ...msgTransfer,
          timeout_height: msgTransfer.timeout_height
            ? {
                revision_height: msgTransfer.timeout_height.revision_height.toString() || '0',
                revision_number: msgTransfer.timeout_height.revision_number.toString() || '0'
              }
            : {},
          timeout_timestamp: msgTransfer.timeout_timestamp.toString() || '0'
        };
      },
      fromAmino: (data) => {
        const msgTransfer = new message.ibc.applications.transfer.v1.MsgTransfer({
          ...data,
          timeout_height: data.timeout_height
            ? {
                revision_height: Long.fromString(data.timeout_height.revision_height || '0', true),
                revision_number: Long.fromString(data.timeout_height.revision_number || '0', true)
              }
            : {},
          timeout_timestamp: Long.fromString(data.timeout_timestamp || '0', true)
        });
        return message.ibc.applications.transfer.v1.MsgTransfer.encode(msgTransfer).finish();
      }
    },
    '/cosmwasm.wasm.v1.MsgExecuteContract': {
      aminoType: 'wasm/MsgExecuteContract',
      toAmino: (msgExecuteContractAny) => {
        const msgExecuteContract = message.cosmwasm.wasm.v1.MsgExecuteContract.decode(msgExecuteContractAny);
        return { ...msgExecuteContract, msg: JSON.parse(Buffer.from(msgExecuteContract.msg).toString('ascii')) };
      },
      fromAmino: (data) => {
        const msgExecuteContract = new message.cosmwasm.wasm.v1.MsgExecuteContract({
          ...data,
          msg: Buffer.from(JSON.stringify(data.msg))
        });
        return message.cosmwasm.wasm.v1.MsgExecuteContract.encode(msgExecuteContract).finish();
      }
    }
  };
}

export default class AminoTypes {
  constructor({ additions = {}, prefix = 'orai' } = {}) {
    const additionalAminoTypes = Object.values(additions);
    const filteredDefaultTypes = Object.entries(createDefaultTypes(prefix)).reduce(
      (acc, [key, value]) => (additionalAminoTypes.find(({ aminoType }) => value.aminoType === aminoType) ? acc : Object.assign(Object.assign({}, acc), { [key]: value })),
      {}
    );
    this.register = Object.assign(Object.assign({}, filteredDefaultTypes), additions);
  }
  toAmino({ type_url, value }) {
    const converter = this.register[type_url];
    if (!converter) {
      throw new Error(
        'Type URL does not exist in the Amino message type register. ' +
          'If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. ' +
          'If you think this message type should be included by default, please open an issue at https://github.com/oraichain/cosmosjs/issues.'
      );
    }
    return {
      type: converter.aminoType,
      value: converter.toAmino(value)
    };
  }
  fromAmino({ type, value }) {
    const result = Object.entries(this.register).find(([_typeUrl, { aminoType }]) => aminoType === type);
    if (!result) {
      throw new Error(
        'Type does not exist in the Amino message type register. ' +
          'If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. ' +
          'If you think this message type should be included by default, please open an issue at https://github.com/oraichain/cosmosjs/issues.'
      );
    }
    const [type_url, converter] = result;
    return {
      type_url: type_url,
      value: converter.fromAmino(value)
    };
  }
}
