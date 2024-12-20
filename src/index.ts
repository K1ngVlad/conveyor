import express from 'express';
import { csvService } from './services';

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
      csvService.readRates();
      res.send('Message');
    } catch (e) {
      next(e);
    }
  });

  app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
  });
}

startServer();
