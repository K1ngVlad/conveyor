"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const services_1 = require("./services");
const { Worker, isMainThread } = require('worker_threads');
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Считывание исходных данных...');
        const payments = yield services_1.csvService.readPayments();
        const providers = yield services_1.csvService.readProviders();
        const step = 10000;
        const numberOfCycles = Math.ceil(payments.length / step);
        let data = [];
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
                worker.on('message', (result) => __awaiter(void 0, void 0, void 0, function* () {
                    data = data.concat(result);
                    completed++;
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(`Выполнено: ${Math.round((completed / numberOfCycles) * 100)}%`);
                    if (completed === numberOfCycles) {
                        console.log('\nЗапись результатов в файл...');
                        try {
                            yield services_1.csvService.writeResult(data);
                            console.log('Файл успешно создан, хорошего дня!');
                        }
                        catch (error) {
                            console.log(error);
                        }
                        finally {
                            process.exit();
                        }
                    }
                }));
                worker.on('error', (err) => {
                    console.error('Ошибка в потоке:', err);
                });
                worker.on('exit', (code) => {
                    if (code !== 0) {
                        console.error(`Поток завершился с кодом ${code}`);
                    }
                });
            }
        }
    }
    catch (e) {
        console.error(e);
    }
});
start();
