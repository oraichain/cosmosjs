import { Argv } from 'yargs';
const ignroredList = [
  'oraivaloper14vcw5qk0tdvknpa38wz46js5g7vrvut8ku5kaa',
  'oraivaloper1rqq57xt5r5pnuguffcrltnvkul7n0jdxxdgey0',
  'oraivaloper1mxqeldsxg60t2y6gngpdm5jf3k96dnju5el96f'
];

export default async (yargs: Argv) => {
  const { argv } = yargs;
  const data = await fetch(`${argv.url}/cosmos/staking/v1beta1/validators`).then((res) =>
    res.json()
  );
  let results = data.validators;
  for (let index = 0; index < results.length; index++) {
    let operator = results[index];
    if (!ignroredList.includes(operator.operator_address)) {
      console.log(operator.operator_address);
      console.log(operator.description.moniker);
      console.log();
    }
  }
};
