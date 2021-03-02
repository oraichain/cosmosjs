import fetch from 'node-fetch';

export default async (argv) => {
  const data = await fetch(
    `${argv.url}/cosmos/bank/v1beta1/balances/${argv.address}`
  ).then((res) => res.json());
  console.log(data);
};
