import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
dotenv.config({ silent: process.env.NODE_ENV === 'development' });

yargs(hideBin(process.argv))
  .command('send [address]', 'send orai token', require('./cmd/send').default)
  .command('balance [address]', 'get orai token balance', require('./cmd/balance').default)
  .command('staking', 'staking commands', require('./cmd/staking').default)
  .command('provider', 'update provider data', require('./cmd/provider').default)
  .command('distr', 'distribution commands', require('./cmd/distr').default)
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
