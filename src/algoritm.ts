import { conveyerService, csvService } from './services';

const start = async () => {
  try {
    const payments = await csvService.readPayments();
    const providers = await csvService.readProviders();

    const data = await conveyerService.getResult(payments, providers);

    await csvService.writeResult(data);
  } catch (e) {
    console.error(e);
  }
};

start();
