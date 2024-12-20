import fs from 'fs';
import path from 'path';
import { parse, writeToStream } from 'fast-csv';
import {
  PaymentEntity,
  ProviderEntity,
  RateEntity,
  ResultEntity,
} from '../entities';
import { Row } from '@fast-csv/format';

class CSVService {
  readonly dataDirectory = path.join(__dirname, '../data');

  readonly paymentsPath_1: string = path.join(
    this.dataDirectory,
    'payments_1.csv'
  );
  readonly paymentsPath_2: string = path.join(
    this.dataDirectory,
    'payments_2.csv'
  );
  readonly providersPath_1: string = path.join(
    this.dataDirectory,
    'providers_1.csv'
  );
  readonly providersPath_2: string = path.join(
    this.dataDirectory,
    'providers_2.csv'
  );
  readonly exRatesPath: string = path.join(this.dataDirectory, 'ex_rates.csv');
  readonly resultPath: string = path.join(this.dataDirectory, 'result.csv');

  read = async (filePath: string): Promise<unknown> => {
    const results: unknown[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  };

  write = async (filePath: string, data: Row[]) => {
    const writableStream = fs.createWriteStream(filePath);
    return new Promise((resolve, reject) => {
      writeToStream(writableStream, data, { headers: true })
        .on('finish', resolve)
        .on('error', reject);
    });
  };

  readPayments = async (): Promise<PaymentEntity[]> => {
    try {
      const data = <PaymentEntity[]>await this.read(this.paymentsPath_1);
      console.log('Data read from CSV:', data);
      return data;
    } catch (error) {
      console.error('Error processing CSV files:', error);
      return [];
    }
  };

  readProviders = async (): Promise<ProviderEntity[]> => {
    try {
      const data = <ProviderEntity[]>await this.read(this.providersPath_1);
      console.log('Data read from CSV:', data);
      return data;
    } catch (error) {
      console.error('Error processing CSV files:', error);
      return [];
    }
  };

  readRates = async (): Promise<RateEntity[]> => {
    try {
      const data = <RateEntity[]>await this.read(this.exRatesPath);
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  writeResult = async (data: ResultEntity[]): Promise<void> => {
    try {
      await this.write(this.resultPath, data);
    } catch (error) {
      console.log(error);
    }
  };
}

const csvService = new CSVService();

export { csvService };
