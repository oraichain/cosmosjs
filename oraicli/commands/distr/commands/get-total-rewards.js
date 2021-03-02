import fetch from 'node-fetch';

export default async (argv) => {

    var rewards = []
    const { sendAddresses, validators } = argv;

    // map through the send addresses list
    const promises = sendAddresses.map(async (list, index) => {
        // request details from GitHub’s API with Axios
        const data = await fetch(
            `${argv.url}/cosmos/distribution/v1beta1/delegators/${list}/rewards/${validators[index]}`
        ).then((res) => res.json());
        if (data.rewards[0] !== undefined) {
            return (data.rewards[0].amount) / 1000000
        }
    })

    // wait until all promises resolve

    rewards = await Promise.all(promises)
    rewards = rewards.filter((element) => {
        return element !== undefined;
    })
    return rewards;
};