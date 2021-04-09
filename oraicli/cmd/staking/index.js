import { Argv } from 'yargs';
export default async (yargs: Argv) => {
    yargs
        .usage('usage: $0 staking <command> [options]')
        .command('delegate', 'Delegate to a validator', require('./cmd/delegate').default)
        .option('address', {
            describe: 'validator operator address to delegate to',
            default: '',
            type: 'string'
        })
        .option('amount', {
            describe: 'the delegated amount',
            default: '0',
            type: 'string'
        })
        .command('get-validators', 'Get a list of validators', require('./cmd/get-validators').default)
};
