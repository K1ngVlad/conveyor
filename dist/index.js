"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const services_1 = require("./services");
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.send('Message');
            }
            catch (e) {
                next(e);
            }
        }));
        app.get('/test', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payments = yield services_1.csvService.readPayments();
                const providers = yield services_1.csvService.readProviders();
                const data = yield services_1.conveyerService.getResult(payments, providers);
                yield services_1.csvService.writeResult(data);
                res.send('Message');
            }
            catch (e) {
                console.error(e);
                next(e);
            }
        }));
        app.listen(3000, () => {
            console.log('Server is running at http://localhost:3000');
        });
    });
}
startServer();
