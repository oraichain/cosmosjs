import { Argv } from 'yargs';
import fs from 'fs';

export default async (yargs: Argv) => {
  const { argv } = yargs
    .positional('script', {
      describe: 'the script type',
      type: 'string'
    })
    .positional('name', {
      describe: 'the script name',
      type: 'string'
    })
  const [script, name] = argv._.slice(-2);
  console.log("script: ", script)
  const data = await fetch(`${argv.url}/provider/${script}/${name}`).then((res) => res.json());
  console.log(data)
  if (data.code === undefined) {
    fs.writeFileSync('./is_exist.txt', '');
  } else {
    fs.writeFileSync('./is_exist.txt', data.code.toString());
  }
};

// yarn oraicli provider get-script datasource nl008
