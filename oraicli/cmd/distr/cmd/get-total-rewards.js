import { Argv } from 'yargs';

export default async (yargs: Argv) => {
  const { argv } = yargs
    .option('sendAddresses', {
      describe: 'addresses that have staked into the validators',
      type: 'array',
      default: process.env.LIST_SEND_ADDRESSES.split(',') || [
        'orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg'
      ]
    })
    .option('validators', {
      describe: 'list of validators we want to check',
      type: 'array',
      default: process.env.LIST_VALIDATORS.split(',') || [
        'oraivaloper1lwsq3768lunk78wdsj836svlfpfs09m3mre3wk'
      ]
    });

  var rewards = [];
  const { sendAddresses, validators } = argv;

  // map through the send addresses list
  const promises = sendAddresses.map(async (list, index) => {
    // request details from GitHub’s API with Axios
    const data = await fetch(
      `${argv.url}/cosmos/distribution/v1beta1/delegators/${list}/rewards/${validators[index]}`
    ).then((res) => res.json());
    if (data.rewards[0] !== undefined) {
      return data.rewards[0].amount / 1000000;
    }
  });

  // wait until all promises resolve

  rewards = await Promise.all(promises);
  rewards = rewards.filter((element) => {
    return element !== undefined;
  });
  return rewards;
};
