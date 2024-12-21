import express from 'express';
import { conveyerService, csvService } from './services';
import { ResultEntity } from './entities';

async function startServer() {
  const app = express();

  app.get('/', async (req, res, next) => {
    try {
      res.send('Message');
    } catch (e) {
      next(e);
    }
  });

  app.get('/test', async (req, res, next) => {
    try {
      const payments = await csvService.readPayments();
      const providers = await csvService.readProviders();

      const data = await conveyerService.getResult(payments, providers);

      await csvService.writeResult(data);

      res.send('Message');
    } catch (e) {
      console.error(e);
      next(e);
    }
  });

  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
  });
}

startServer();
