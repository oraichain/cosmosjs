import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
dotenv.config({ silent: process.env.NODE_ENV === 'development' });

yargs(hideBin(process.argv))
  .command('send [address]', 'send orai token', require('./commands/send').default)
  .command('balance [address]', 'get orai token balance', require('./commands/balance').default)
  .command('staking', 'staking commands', require('./commands/staking').default)
  .command('provider', 'update provider data', require('./commands/provider').default)
  .command('distr', 'distribution commands', require('./commands/distr').default)
  .option('chain-id', {
    type: 'string',
    default: 'Oraichain'
  })
  .option('mnemonic', {
    type: 'string',
    default: process.env.SEND_MNEMONIC
  })
  .option('url', {
    default: 'http://localhost:1317',
    type: 'string'
  }).argv;
