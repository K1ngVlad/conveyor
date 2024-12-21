import { RateEntity } from '../entities';
import { csvService } from './csv.service';

class ConvertService {
  rates: Map<string, number> = new Map<string, number>();

  roundedNumber = (value: number, accurancy: number) => {
    return Math.round(value * 10 ** accurancy) / 10 ** accurancy;
  };

  clearRates = (): void => {
    this.rates.clear();
  };

  setRates = (ratesData: RateEntity[]): void => {
    this.clearRates();
    ratesData.forEach((rateItem) => {
      this.rates.set(rateItem.destination, rateItem.rate);
    });
  };

  setRatesFromData = async (): Promise<void> => {
    const ratesData = await csvService.readRates();
    this.setRates(ratesData);
  };

  convertToDollars = (currency: string, value: number): number => {
    const rate = this.rates.get(currency);
    if (rate) {
      return Number(value) * Number(rate);
    }
    return 0;
  };

  convertFromDollars = (currency: string, value: number): number => {
    const rate = this.rates.get(currency);
    if (rate) {
      const result = Number(value) / Number(rate);
      return this.roundedNumber(result, 1);
    }
    return 0;
  };
}

const convertService = new ConvertService();

export { convertService };
