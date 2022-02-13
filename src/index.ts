import dotenv from 'dotenv';
dotenv.config(); // make sure to call this before importing from other files so that the environment variables are loaded

import { ArgumentParser } from 'argparse';
import { StakingTransactionsDownloader } from './stakingTransactionsDownloader/stakingTransactionsDownloader';
import { StakingTransaction } from './stakingTransactionsDownloader/types';
import { PricedStakingTransactionConverter } from './pricedStakingTransactionConverter/pricedStakingTransactionConverter';
import { PricedStakingTransaction } from './pricedStakingTransactionConverter/types';
import path from 'path';
import { TransactionsFileWriter } from './transactionsFileWriter/transactionsFileWriter';
import _ from 'lodash';
import { Logger } from './logger/logger';
import { DateTime } from 'luxon';

export type Args = {
    daysAgo: number | null;
    currency: string;
    outputDirectory: string;
    quiet: boolean;
};

const main = async (args: Args) => {
    const logger = new Logger(args.quiet);
    const startOfToday = DateTime.now().startOf('day');
    const oldestAllowedRewardDate = args.daysAgo ? startOfToday.minus({ days: args.daysAgo }) : null;

    const stakingTransactionsDownloader = new StakingTransactionsDownloader(logger);
    const pricedStakingTransactionConverter = new PricedStakingTransactionConverter(args.currency, logger);
    const transactionsFileWriter = new TransactionsFileWriter(args.outputDirectory, args.currency, logger);

    const stakingTransactions: StakingTransaction[] = await stakingTransactionsDownloader.getStakingTransactions(
        oldestAllowedRewardDate
    );
    const pricedStakingTransactions: PricedStakingTransaction[] = await pricedStakingTransactionConverter.convert(
        stakingTransactions
    );
    const sortedTransactions = _.sortBy(pricedStakingTransactions, (x) => x.dateReceived, 'asc');
    await transactionsFileWriter.writeTransactions(sortedTransactions, 'transactions.csv');
};

const getArguments = (): Args => {
    const parser = new ArgumentParser({
        description: '',
    });

    parser.add_argument('-d', '--daysAgo', {
        default: null,
        help: `The number of past days to include transactions from. If this is not given, then the program will attempt
         to retrieve all transactions from as far back as possible`,
    });

    parser.add_argument('-c', '--currency', {
        default: 'USD',
        help: 'The currency used for retrieving the price of the crypto asset. Default is USD.',
    });

    parser.add_argument('-o', '--outputDirectory', {
        default: path.join(__dirname, `../transactions`),
        help: `The directory where the output file should be written. Defaults to a folder within the root directory of
         where this program is running.`,
    });

    parser.add_argument('-q', '--quiet', {
        default: false,
        help: `Only display errors. Default is false`,
        action: 'store_true',
    });

    const args: Args = parser.parse_args();
    return args;
};

const args = getArguments();
void main(args);
