import { Argv } from 'yargs';

export default async (yargs: Argv) => {
  yargs
    .command(
      'get-total-rewards',
      'Get total rewards of all genesis and trusted validators',
      require('./cmd/get-total-rewards').default
    )
    .command(
      'send-rewards',
      'Send rewards to all genesis and trusted validators',
      require('./cmd/send-rewards').default
    );
};
