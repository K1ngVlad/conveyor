import { conveyerService, csvService } from './services';
import { ResultEntity } from './entities';
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require('worker_threads');

const start = async () => {
  try {
    console.log('Считываем данные оплатежах');
    const payments = await csvService.readPayments();
    console.log('Считываем данные о провайдерах');
    const providers = await csvService.readProviders();
    const step = 10000;
    const numberOfCycles = Math.ceil(payments.length / step);
    let data: ResultEntity[] = [];

    if (!isMainThread) {
      parentPort.postMessage('ЧУМБА');
    }

    // console.log('Начинаем расчет:\n');
    // for (let i = 0; i < numberOfCycles; i++) {
    //   process.stdout.clearLine(0);
    //   process.stdout.cursorTo(0);
    //   process.stdout.write(
    //     `Выполнено: ${Math.round((i / numberOfCycles) * 100)}%`
    //   );
    //   if (i + 1 < numberOfCycles) {
    //     const dataPart = await conveyerService.getResult(
    //       payments,
    //       providers,
    //       0,
    //       step * i
    //     );
    //     data = data.concat(dataPart);
    //   } else {
    //   const dataPart = await conveyerService.getResult(
    //     payments,
    //     providers,
    //     step,
    //     step * i
    //   );

    //   const dataPart = await conveyerService.getResult(
    //     payments,
    //     providers,
    //     step,
    //     step * i
    //   );
    //   data = data.concat(dataPart);
    //   //   }
    // }

    // process.stdout.clearLine(0);
    // process.stdout.cursorTo(0);
    // process.stdout.write('Расчет завершен\n');
    // console.log('Производим запись в файл');
    // await csvService.writeResult(data);

    console.log(numberOfCycles);

    if (isMainThread) {
      // Основной поток
      let completed = 0;
      for (let i = 0; i < numberOfCycles; i++) {
        console.log('Создание потока');
        const worker = new Worker('./dist/work.js', {
          workerData: {
            step,
            offset: step * i,
            payments,
            providers: providers.slice(
              step * i,
              step > payments.length - step * i
                ? payments.length
                : step + step * i
            ),
          },
        });

        worker.on('message', (result: ResultEntity[]) => {
          console.log('Чумба ЮМБА');
          data = data.concat(result);
          completed++;
          // process.stdout.clearLine(0);
          // process.stdout.cursorTo(0);
          // process.stdout.write(
          //   `Выполнено: ${Math.round((completed / numberOfCycles) * 100)}%`
          // );
          if (completed + 1 === numberOfCycles) {
            console.log('\nОбработка завершена.');
            csvService.writeResult(data);
            // console.log('Итоговые данные:', data);
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
    } else {
      // Поток-воркер
      // const { step, offset, payments, providers } = workerData;
      // conveyerService
      //   .getResult(payments, providers, step, offset)
      //   .then((dataPart) => {
      //     parentPort.postMessage(dataPart);
      //   })
      //   .catch((err) => {
      //     throw err;
      //   });
    }
  } catch (e) {
    console.error(e);
  }
};

start();
