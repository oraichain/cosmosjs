import { Argv } from 'yargs';
export default async (yargs: Argv) => {
  yargs
    .usage('usage: $0 wasm <command> [options]')
    .command('query', 'query a smart contract', require('./cmd/query-smart').default)
    .command('execute', 'execute a smart contract', require('./cmd/execute').default)
    .command('deploy', 'deploy a smart contract', require('./cmd/deploy').default)
    .option('input', {
      describe: 'the input to initilize smart contract',
      default: '{}',
      type: 'string'
    });
};
