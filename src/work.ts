import { conveyerService, csvService } from './services';
import { ResultEntity } from './entities';
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require('worker_threads');

const { payments, providers } = workerData;
conveyerService
  .getResult(payments, providers)
  .then((dataPart) => {
    parentPort.postMessage(dataPart);
  })
  .catch((err) => {
    throw err;
  });
