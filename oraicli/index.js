import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .command('send [address]', 'send orai token', (yargs) => {
    yargs.positional('address', {
      describe: 'the orai address',
      type: 'string',
      default: 'orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n'
    });
  })
  .command('balance [address]', 'get orai token balance', (yargs) => {
    yargs.positional('address', {
      describe: 'the orai address',
      type: 'string',
      default: 'orai1u4jjn7adh46gmtnf2a9tsc2g9nm489d7nuhv8n'
    });
  })
  .command('create', 'create a new item', (yargs) => {
    yargs
      .usage('usage: $0 create <item> [options]')
      .command('project', 'create a new project', () => {
        console.log('creating project :)');
      })
      .command('module', 'create a new module', () => {
        console.log('creating module :)');
      });
  })
  .option('chain-id', {
    type: 'string',
    default: 'Oraichain'
  })
  .option('mnemonic', {
    type: 'string',
    default:
      'best voice endless similar spell destroy brown accident news round dream wrap vote guilt merry satoshi produce despair merit fence oval ball notice mesh'
  })
  .option('url', {
    default: 'http://localhost:1317',
    type: 'string'
  })
  .option('amount', {
    default: 10,
    type: 'number'
  }).argv;

const command = argv._.shift();
if (command) {
  import('./commands/' + command).then(({ default: fn }) => fn(argv));
}
