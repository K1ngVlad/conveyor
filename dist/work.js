"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("./services");
const { Worker, isMainThread, parentPort, workerData, } = require('worker_threads');
const { payments, providers } = workerData;
services_1.conveyerService
    .getResult(payments, providers)
    .then((dataPart) => {
    parentPort.postMessage(dataPart);
})
    .catch((err) => {
    throw err;
});
