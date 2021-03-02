import { Argv } from 'yargs';
export default async (yargs: Argv) => {
  yargs
    .usage('usage: $0 provider <command> [options]')
    .command(
      'set-datasource',
      'Set a new data source into the system',
      require('./commands/set-datasource').default
    )
    .command(
      'get-datasource',
      'Get datsource infomation',
      require('./commands/get-datasource').default
    );
};
