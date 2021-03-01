import request from 'request';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const list = process.env.LIST_SEND_ADDRESSES.split(",") || ["orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg"];
const validators = process.env.LIST_VALIDATORS.split(",") || ["oraivaloper1lwsq3768lunk78wdsj836svlfpfs09m3mre3wk"];
const monikers = process.env.LIST_MONIKERS.split(",") || ["test"];
const ip = process.env.IP || "localhost";

for (let index = 0; index < list.length; index++) {
    var options = {
        'method': 'GET',
        'url': `http://${ip}:1317/cosmos/distribution/v1beta1/delegators/${list[index]}/rewards/${validators[index]}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        let result = JSON.parse(response.body);
        if (result.rewards[0] !== undefined) {
            console.log(monikers[index])
            console.log(result.rewards[0].amount / 1000000)
            console.log()
        }
    });
}