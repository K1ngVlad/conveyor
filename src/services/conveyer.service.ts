import {
  PaymentEntity,
  ProviderEntity,
  RatedProviderEntity,
  ResultEntity,
} from '../entities';
import { convertService } from './convert.service';

class ConveyerService {
  providersSum: Map<string, number> = new Map<string, number>();
  providersData: Map<string, ProviderEntity> = new Map<
    string,
    ProviderEntity
  >();

  clearProvidersSum = () => {
    this.providersSum.clear();
  };

  clearProvidersData = () => {
    this.providersData.clear();
  };

  initProvidersSum = (providers: ProviderEntity[]) => {
    this.clearProvidersSum();
    providers.forEach((provider) => {
      this.providersSum.set(provider.ID, 0);
    });
  };

  initProvidersData = (providers: ProviderEntity[]) => {
    this.clearProvidersData();
    providers.forEach((provider) => {
      this.providersData.set(provider.ID, provider);
    });
  };

  sigmoid = (value: number, diff: number = 1, offset: number = 0): number => {
    value = Number(value);
    return 1 / (1 + Math.exp((-value + offset) / diff));
  };

  getResult = async (
    payments: PaymentEntity[],
    providers: ProviderEntity[]
  ): Promise<ResultEntity[]> => {
    await convertService.setRatesFromData();
    this.initProvidersSum(providers);
    this.initProvidersData(providers);
    const providersIds = providers.map((provider) => provider.ID);
    const uniqueProvidersIds = [...new Set(providersIds)];
    const result = payments.map((payment) =>
      this.getResultItem(payment, uniqueProvidersIds)
    );
    return result;
  };

  getResultItem = (
    payment: PaymentEntity,
    providersIds: string[]
  ): ResultEntity => {
    const selectedProvidersIds = this.selectProviders(payment, providersIds);

    if (!selectedProvidersIds.length) return { ...payment, flow: '' };

    const ratedProviders: RatedProviderEntity[] = selectedProvidersIds.map(
      (providerId) => {
        const provider = this.providersData.get(providerId);

        if (!provider) {
          return {
            TIME: '',
            ID: '',
            CONVERSION: 0,
            AVG_TIME: 0,
            MIN_SUM: 0,
            MAX_SUM: 0,
            LIMIT_MIN: 0,
            LIMIT_MAX: 0,
            LIMIT_BY_CARD: '-',
            COMMISSION: 0,
            CURRENCY: '',
            RATING: 0,
          };
        }

        const profit = this.calculateProfit(payment, provider);
        const customerSatisfaction =
          this.calculateCustomerSatisfaction(provider);
        const fillingProvider = this.calculateFillingProvider(
          payment,
          provider
        );

        const overallProviderRating = this.getOverallRate(
          profit,
          customerSatisfaction,
          fillingProvider
        );

        return { ...provider, RATING: overallProviderRating };
      }
    );

    const sortedProviders = ratedProviders.sort((a, b) => b.RATING - a.RATING);

    let ids;

    if (sortedProviders.length > 3) {
      ids = sortedProviders.slice(0, 3).map((provider) => provider.ID);
    } else {
      ids = sortedProviders.map((provider) => provider.ID);
    }

    const firstId = ids[0];
    if (firstId) {
      const firstSum = this.providersSum.get(firstId);
      if (firstSum || firstSum == 0) {
        const newFirstSum =
          firstSum + payment.amount * sortedProviders[0].CONVERSION;
        this.providersSum.set(firstId, newFirstSum);
      }
    }

    const secondId = ids[1];
    if (secondId) {
      const secondSum = this.providersSum.get(secondId);
      if (secondSum || secondSum == 0) {
        const newSecondSum =
          secondSum +
          payment.amount *
            (1 - sortedProviders[0].CONVERSION) *
            sortedProviders[1].CONVERSION;
        this.providersSum.set(secondId, newSecondSum);
      }
    }

    const thirdId = ids[2];
    if (thirdId) {
      const thirdSum = this.providersSum.get(thirdId);
      if (thirdSum || thirdSum == 0) {
        const newThirdSum =
          thirdSum +
          payment.amount *
            (1 -
              sortedProviders[0].CONVERSION -
              (1 - sortedProviders[0].CONVERSION) *
                sortedProviders[1].CONVERSION) *
            sortedProviders[2].CONVERSION;
        this.providersSum.set(thirdId, newThirdSum);
      }
    }

    const idsString = ids.join('-');

    return {
      ...payment,
      flow: idsString,
    };
  };

  selectProviders = (
    payment: PaymentEntity,
    providersIds: string[]
  ): string[] => {
    return providersIds.filter((providerId) => {
      const provider = this.providersData.get(providerId);

      if (!provider) return false;

      if (provider.CONVERSION < 0.1) return false;

      if (provider.AVG_TIME > 120) return false;

      if (provider.CURRENCY !== payment.cur) false;

      if (
        payment.amount < provider.MIN_SUM ||
        payment.amount > provider.MAX_SUM
      )
        return false;

      const providerSum = this.providersSum.get(providerId);

      if (!providerSum && providerSum !== 0) return false;

      if (Number(providerSum) + Number(payment.amount) > provider.LIMIT_MAX)
        return false;

      return true;
    });
  };

  calculateProfit = (
    payment: PaymentEntity,
    provider: ProviderEntity
  ): number => {
    const ammount = convertService.convertToDollars(
      payment.cur,
      payment.amount
    );

    const netPart = 1 - provider.COMMISSION;

    return ammount * netPart * provider.CONVERSION;
  };

  calculateCustomerSatisfaction = (provider: ProviderEntity) => {
    const timeOffset = 14;
    const timeDiff = 4;

    const normalizeTimeFactor =
      1 - this.sigmoid(provider.AVG_TIME, timeDiff, timeOffset);

    return provider.CONVERSION * normalizeTimeFactor;
  };

  calculateFillingProvider = (
    payment: PaymentEntity,
    provider: ProviderEntity
  ) => {
    const providerSum = this.providersSum.get(provider.ID);

    if (!providerSum && providerSum !== 0) return 0;

    const newProviderSum = Number(providerSum) + Number(payment.amount);

    const filling =
      provider.LIMIT_MIN > providerSum ? providerSum / provider.LIMIT_MIN : 1;

    const newfilling =
      provider.LIMIT_MIN > newProviderSum
        ? newProviderSum / provider.LIMIT_MIN
        : 1;

    return 1 - (filling + newfilling) / 2;
  };

  getOverallRate = (
    profit: number,
    customerSatisfaction: number,
    fillingProvider: number
  ): number => {
    const profit_k = 0.5;
    const customer_k = 0.2;
    const provider_k = 0.3;

    const overallProviderRating =
      profit *
      (profit_k +
        customerSatisfaction * customer_k +
        fillingProvider * provider_k);

    return overallProviderRating;
  };
}

const conveyerService = new ConveyerService();

export { conveyerService };
