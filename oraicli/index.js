import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .command('send [address]', 'send orai token', (yargs) => {
    yargs
      .positional('address', {
        describe: 'the orai address',
        type: 'string',
        default: 'orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n'
      })
      .option('amount', {
        default: '10',
        type: 'string'
      });
  })
  .command('balance [address]', 'get orai token balance', (yargs) => {
    yargs.positional('address', {
      describe: 'the orai address',
      type: 'string',
      default: 'orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n'
    });
  })
  .command('provider', 'update provider data', (yargs) => {
    yargs
      .usage('usage: $0 provider <command> [options]')
      .command(
        'set-datasource',
        'Set a new data source into the system',
        (yargs) => {
          yargs
            .positional('name', {
              describe: 'the datasource name',
              type: 'string'
            })
            .positional('contract', {
              describe: 'the datasource contract address',
              type: 'string'
            })
            .positional('description', {
              describe: 'the datasource description',
              type: 'string'
            });
        }
      )
      .command('get-datasource', 'Get datsource infomation', (yargs) => {
        yargs.positional('name', {
          describe: 'the datasource name',
          type: 'string'
        });
      });
  })
  .option('chain-id', {
    type: 'string',
    default: 'Oraichain'
  })
  .option('mnemonic', {
    type: 'string',
    default: process.env.MNEMONIC
    // equip swift twelve reveal execute ten news jeans junk talk bronze dignity wrong skirt cigar large situate dumb reduce wait gadget axis deputy update
  })
  .option('url', {
    default: 'http://localhost:1317',
    type: 'string'
  }).argv;

const command = argv._.shift();
if (command) {
  import('./commands/' + command).then(({ default: fn }) => fn(argv));
}
