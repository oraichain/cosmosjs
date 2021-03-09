import { Argv } from 'yargs';

export default async (yargs: Argv) => {
  const { argv } = yargs
    .positional('address', {
      describe: 'the smart contract address',
      type: 'string'
    })
    .positional('input', {
      describe: 'the input of smart contract',
      type: 'string'
    });
  const [address, input] = argv._.slice(-2);
  const data = await fetch(`${argv.url}/wasm/v1beta1/contract/${address}/smart/${Buffer.from(input).toString('base64')}`).then((res) => res.json());
  console.log(data);
};
