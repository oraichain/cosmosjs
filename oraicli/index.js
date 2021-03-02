import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'development' });

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
  .command('staking', 'staking commands', (yargs) => {
    yargs
      .command(
        'get-validators',
        'Get a list of validators',
        (yargs) => {
          yargs
        }
      )
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
  .command('distr', 'distribution commands', (yargs) => {
    yargs
      .command(
        'get-total-rewards',
        'Get total rewards of all genesis and trusted validators',
        (yargs) => {
          yargs
            .option('sendAddresses', {
              describe: 'addresses that have staked into the validators',
              type: 'array',
              default: process.env.LIST_SEND_ADDRESSES.split(",") || ["orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg"]
            })
            .option('validators', {
              describe: 'list of validators we want to check',
              type: 'array',
              default: process.env.LIST_VALIDATORS.split(",") || ["oraivaloper1lwsq3768lunk78wdsj836svlfpfs09m3mre3wk"]
            })
        }
      )
      .command(
        'send-rewards',
        'Send rewards to all genesis and trusted validators',
        (yargs) => {
          yargs
            .option('sendAddresses', {
              describe: 'addresses that have staked into the validators',
              type: 'array',
              default: process.env.LIST_SEND_ADDRESSES.split(",") || ["orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg"]
            })
            .option('validators', {
              describe: 'list of validators we want to check',
              type: 'array',
              default: process.env.LIST_VALIDATORS.split(",") || ["oraivaloper1lwsq3768lunk78wdsj836svlfpfs09m3mre3wk"]
            })
            .option('receiveAddresses', {
              describe: 'addresses that will receive the rewards',
              type: 'array',
              default: process.env.LIST_RECEIVE_ADDRESSES.split(",") || ["orai1k54q0nf5x225wanfwrlrkd2cmzc3pv9yklkxmg"]
            })
            .option('mnemonics', {
              describe: 'mnemonics of addresses that will send the rewards',
              type: 'array',
              default: process.env.LIST_SEND_MNEMONIC.split(",") || ["survey maze spatial profit narrow memory drop load assist produce exact leaf unique adult token idea mammal cradle catch salmon blade term rubber else"]
            })
        }
      )
  })
  .option('chain-id', {
    type: 'string',
    default: 'Oraichain'
  })
  .option('mnemonic', {
    type: 'string',
    default:
      'survey maze spatial profit narrow memory drop load assist produce exact leaf unique adult token idea mammal cradle catch salmon blade term rubber else'
  })
  .option('url', {
    default: 'http://3.139.240.126:1317',
    type: 'string'
  }).argv;

const command = argv._.shift();
if (command) {
  import('./commands/' + command).then(({ default: fn }) => fn(argv));
}
