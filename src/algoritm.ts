import * as readline from 'readline';
import { csvService } from './services';
import { ResultEntity } from './entities';
const { Worker, isMainThread } = require('worker_threads');

const start = async () => {
  try {
    console.log('Считывание исходных данных...');
    const payments = await csvService.readPayments();
    const providers = await csvService.readProviders();

    const step = 10000;
    const numberOfCycles = Math.ceil(payments.length / step);
    let data: ResultEntity[] = [];

    if (isMainThread) {
      // Основной поток
      let completed = 0;
      console.log('Выполняются вычисление...');
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      // process.stdout.clearLine(0);
      // process.stdout.cursorTo(0);
      process.stdout.write('Выполнено: 0%');
      for (let i = 0; i < numberOfCycles; i++) {
        const currentPayments = payments.slice(step * i, step * (i + 1));
        const worker = new Worker('./dist/work.js', {
          workerData: {
            step,
            offset: step * i,
            payments: currentPayments,
            providers,
          },
        });
        worker.on('message', async (result: ResultEntity[]) => {
          data = data.concat(result);
          completed++;
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(
            `Выполнено: ${Math.round((completed / numberOfCycles) * 100)}%`
          );
          if (completed === numberOfCycles) {
            console.log('\nЗапись результатов в файл...');
            try {
              await csvService.writeResult(data);
              console.log('Файл успешно создан, хорошего дня!');
            } catch (error) {
              console.log(error);
            } finally {
              process.exit();
            }
          }
        });

        worker.on('error', (err: any) => {
          console.error('Ошибка в потоке:', err);
        });

        worker.on('exit', (code: any) => {
          if (code !== 0) {
            console.error(`Поток завершился с кодом ${code}`);
          }
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
};

start();
