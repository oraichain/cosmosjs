import { Argv } from 'yargs';
export default async (yargs: Argv) => {
  yargs
    .usage('usage: $0 provider <command> [options]')
    .command(
      'set-datasource',
      'Set a new data source into the system',
      require('./cmd/set-datasource').default
    )
    .command(
      'set-testcase',
      'Set a new test case into the system',
      require('./cmd/set-testcase').default
    )
    .command(
      'edit-datasource',
      'Edit a data source in the system',
      require('./cmd/edit-datasource').default
    )
    .command(
      'edit-testcase',
      'Edit a test case in the system',
      require('./cmd/edit-testcase').default
    )
    .command(
      'set-oscript',
      'Set an oracle script in the system',
      require('./cmd/set-oscript').default
    )
    .command(
      'edit-oscript',
      'Edit an oracle script in the system',
      require('./cmd/edit-oscript').default
    )
    .command('get-script', 'Get script infomation', require('./cmd/get-script').default)
    .command('decode-tx', 'Decode transaction infomation', require('./cmd/decode-tx').default);
};
