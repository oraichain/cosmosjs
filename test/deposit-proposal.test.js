import Cosmos from '../src';
import dotenv from 'dotenv';

dotenv.config();

const cosmos = new Cosmos('http://testnet-lcd.orai.io', 'Oraichain-testnet');
cosmos.setBech32MainPrefix('orai');

describe('deposit proposal with cosmos-messages correctly', () => {
    it('should deposit proposal correctly', async () => {
        const message = Cosmos.message;
        const childKey = cosmos.getChildKey(process.env.SEND_MNEMONIC);

        const msgSend = new message.cosmos.gov.v1beta1.MsgDeposit({
            depositor: cosmos.getAddress(childKey),
            amount: [{ denom: "orai", amount: "1" }],
            proposal_id: Number(75),
        });

        const msgSendAny = new message.google.protobuf.Any({
            type_url: '/cosmos.gov.v1beta1.MsgDeposit',
            value: message.cosmos.gov.v1beta1.MsgDeposit.encode(msgSend).finish()
        });

        const txBody = new message.cosmos.tx.v1beta1.TxBody({
            messages: [msgSendAny],
            memo: ''
        });

        try {
            const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', undefined, undefined, undefined, true);
            console.log(response);
        } catch (ex) {
            console.log(ex);
        }
    });
});
