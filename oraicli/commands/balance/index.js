import { Argv } from 'yargs';

export default async (yargs: Argv) => {
  const { argv } = yargs.positional('address', {
    describe: 'the orai address',
    type: 'string',
    default: 'orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n'
  });

  const data = await fetch(
    `${argv.url}/cosmos/bank/v1beta1/balances/${argv.address}`
  ).then((res) => res.json());

  console.log(data);
};
