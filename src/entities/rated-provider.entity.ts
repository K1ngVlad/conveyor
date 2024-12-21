import { ProviderEntity } from './provider.entity';

type Rate = {
  RATING: number;
};

type RatedProviderEntity = ProviderEntity & Rate;

export type { RatedProviderEntity };
