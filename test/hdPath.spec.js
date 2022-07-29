import dotenv from 'dotenv';
import assert from 'assert';
import Cosmos from '../src';

dotenv.config();

describe('hd-path', () => {
    it('should broadcast successfully', async () => {
        const cosmos = new Cosmos('https://testnet.lcd.orai.io', 'Oraichain-testnet', 'oraib', "m/44'/118'/0'/0/0");
        const address = cosmos.getAddressFromPub(Buffer.from('A7+UbAoMiYjRejY81kJQ5v3LCBgkvVmJ/Vkk7EF/2RHC', 'base64'));
        console.log("address: ", address)
    });
});
