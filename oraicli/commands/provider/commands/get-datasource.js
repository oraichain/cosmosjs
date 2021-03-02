import { Argv } from 'yargs';

export default async (yargs: Argv) => {
  const { argv } = yargs.positional('name', {
    describe: 'the datasource name',
    type: 'string'
  });
  const [name] = argv._.slice(-1);
  const data = await fetch(`${argv.url}/provider/datasource/${name}`).then((res) => res.json());
  console.log(data);
};
