import request from 'request';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const list = process.env.LIST_SEND_ADDRESSES.split(",") || ["orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg"];
const monikers = process.env.LIST_MONIKERS.split(",") || ["test"];
const url = process.env.URL || "localhost";

let results = [];

for (let index = 0; index < list.length; index++) {
    var options = {
        'method': 'GET',
        'url': `http://${url}:1317/cosmos/bank/v1beta1/balances/${list[index]}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        let result = JSON.parse(response.body).balances[0].amount / 1000000;
        console.log(monikers[index])
        console.log(JSON.parse(response.body).balances[0].amount / 1000000);
        results.push(result)
        console.log()
    });
}