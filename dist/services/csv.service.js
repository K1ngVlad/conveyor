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
exports.csvService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fast_csv_1 = require("fast-csv");
class CSVService {
    constructor() {
        this.dataDirectory = path_1.default.join(__dirname, '../data');
        this.paymentsPath_1 = path_1.default.join(this.dataDirectory, 'payments_1.csv');
        this.paymentsPath_2 = path_1.default.join(this.dataDirectory, 'payments_2.csv');
        this.providersPath_1 = path_1.default.join(this.dataDirectory, 'providers_1.csv');
        this.providersPath_2 = path_1.default.join(this.dataDirectory, 'providers_2.csv');
        this.paymentsPath = path_1.default.join(this.dataDirectory, 'payments.csv');
        this.providersPath = path_1.default.join(this.dataDirectory, 'providers.csv');
        this.exRatesPath = path_1.default.join(this.dataDirectory, 'ex_rates.csv');
        this.resultPath = path_1.default.join(this.dataDirectory, 'result.csv');
        this.read = (filePath) => __awaiter(this, void 0, void 0, function* () {
            const results = [];
            return new Promise((resolve, reject) => {
                fs_1.default.createReadStream(filePath)
                    .pipe((0, fast_csv_1.parse)({ headers: true }))
                    .on('data', (row) => results.push(row))
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
        });
        this.write = (filePath, data) => __awaiter(this, void 0, void 0, function* () {
            const writableStream = fs_1.default.createWriteStream(filePath);
            return new Promise((resolve, reject) => {
                (0, fast_csv_1.writeToStream)(writableStream, data, { headers: true })
                    .on('finish', resolve)
                    .on('error', reject);
            });
        });
        this.readPayments = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.read(this.paymentsPath);
                return data;
            }
            catch (error) {
                return [];
            }
        });
        this.readProviders = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.read(this.providersPath);
                return data;
            }
            catch (error) {
                return [];
            }
        });
        this.readRates = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.read(this.exRatesPath);
                return data;
            }
            catch (error) {
                console.error(error);
                return [];
            }
        });
        this.writeResult = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.write(this.resultPath, data);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
const csvService = new CSVService();
exports.csvService = csvService;
