import { Argv } from 'yargs';
export default async (yargs: Argv) => {
  yargs.usage('usage: $0 wasm <command> [options]').command('query', 'query a smart contract', require('./cmd/query-smart').default);
};
