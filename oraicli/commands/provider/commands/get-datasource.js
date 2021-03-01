import fetch from 'node-fetch';

export default async (argv) => {
  const [name] = argv._;
  const data = await fetch(
    `${argv.url}/provider/datasource/${name}`
  ).then((res) => res.json());
  console.log(data);
};
