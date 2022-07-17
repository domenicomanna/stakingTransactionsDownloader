import { writeToPath } from '@fast-csv/format';
import path from 'path';
import fs from 'fs';
import { PricedStakingTransaction } from '../pricedStakingTransactionConverter/types';
import { Logger } from '../logger/logger';

type FileWritingOptions = {
    outputDirectory: string;
    filename: string;
    columnNames: string[]; // the column names of the csv file. Each column should be a separate entry in the array.
    records: string[][]; // the records that will be written to the csv file. The values of each inner array should match up the the column names
};

export class TransactionsFileWriter {
    private currencyFormatter: Intl.NumberFormat;
    private outputDirectory: string;
    private logger: Logger;

    /**
     *
     * @param outputDirectory - the directory where all files will be written
     * @param currencyCode - the currency code that will be used when formatting currencies
     */
    constructor(outputDirectory: string, currencyCode: string, logger: Logger) {
        this.outputDirectory = outputDirectory;
        this.currencyFormatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 12,
        });
        this.logger = logger;
    }

    public writeTransactions = async (transactions: PricedStakingTransaction[], filename: string): Promise<void> => {
        const columnNames = [
            'Date',
            'Market',
            'Reward Amount in Currency',
            'Reward Amount in Asset',
            'Asset Price',
            'Fee',
            'Type',
            'Exchange',
        ];
        const records = transactions.map((x) => [
            x.dateReceived.toLocaleString({
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }),
            `${x.asset.toUpperCase()}/${x.currencyCode.toUpperCase()}`,
            this.currencyFormatter.format(x.rewardAmountInCurrency),
            x.amount.toString(),
            this.currencyFormatter.format(x.price),
            this.currencyFormatter.format(x.fee),
            x.type,
            x.exchange,
        ]);

        const options: FileWritingOptions = {
            outputDirectory: this.outputDirectory,
            filename: filename,
            columnNames: columnNames,
            records: records,
        };
        await this.handleFileWriting(options);
    };

    private handleFileWriting = (options: FileWritingOptions): Promise<void> => {
        return new Promise((resolve) => {
            if (options.records.length === 0) resolve(undefined);

            if (!fs.existsSync(options.outputDirectory)) {
                fs.mkdirSync(options.outputDirectory, { recursive: true });
            }
            const filePath: string = path.join(options.outputDirectory, options.filename);
            const rows = [...[options.columnNames], ...options.records];

            writeToPath(filePath, rows, {
                quote: '"',
                quoteColumns: true,
                quoteHeaders: true,
                delimiter: ',',
                rowDelimiter: '\n',
            }).on('finish', () => {
                this.logger.log(`Rewards written to ${filePath}`);
                resolve(undefined);
            });
        });
    };
}
