import request from 'request';
import dotenv from "dotenv";
import axios from 'axios';
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const listSendAddresses = process.env.LIST_SEND_ADDRESSES.split(",") || ["orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg"];
const validators = process.env.LIST_VALIDATORS.split(",") || ["oraivaloper1lwsq3768lunk78wdsj836svlfpfs09m3mre3wk"];
const monikers = process.env.LIST_MONIKERS.split(",") || ["test"];
const ip = process.env.IP || "localhost";
var rewards = []

async function getRewards() {
    // map through the repo list
    const promises = listSendAddresses.map(async (list, index) => {
        // request details from GitHub’s API with Axios
        const response = await axios({
            method: 'GET',
            url: `http://${ip}:1317/cosmos/distribution/v1beta1/delegators/${list}/rewards/${validators[index]}`,
            headers: {
            }
        })
        if (response.data.rewards[0] !== undefined) {
            return (response.data.rewards[0].amount) / 1000000
        }
    })

    // wait until all promises resolve

    rewards = await Promise.all(promises)
    rewards = rewards.filter((element) => {
        return element !== undefined;
    })
    return rewards;
}

rewards = await getRewards();

console.log(rewards)

// // for testing only
// for (let index = 0; index < rewards.length; index++) {
//     rewards[index] = rewards[index] * 0.1
// }
export default rewards;