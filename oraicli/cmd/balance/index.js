import { Argv } from 'yargs';

export default async (yargs: Argv) => {
  const { argv } = yargs.positional('address', {
    describe: 'the orai address',
    type: 'string'
  });
  const [address] = argv._.slice(-1);
  try {
    const data = await fetch(`${argv.url}/cosmos/bank/v1beta1/balances/${address}`).then((res) => res.json());

    console.log(data);
  } catch (ex) {
    console.log(ex);
  }
};
