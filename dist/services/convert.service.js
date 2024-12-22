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
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertService = void 0;
const csv_service_1 = require("./csv.service");
class ConvertService {
    constructor() {
        this.rates = new Map();
        this.roundedNumber = (value, accurancy) => {
            return Math.round(value * 10 ** accurancy) / 10 ** accurancy;
        };
        this.clearRates = () => {
            this.rates.clear();
        };
        this.setRates = (ratesData) => {
            this.clearRates();
            ratesData.forEach((rateItem) => {
                this.rates.set(rateItem.destination, rateItem.rate);
            });
        };
        this.setRatesFromData = () => __awaiter(this, void 0, void 0, function* () {
            const ratesData = yield csv_service_1.csvService.readRates();
            this.setRates(ratesData);
        });
        this.convertToDollars = (currency, value) => {
            const rate = this.rates.get(currency);
            if (rate) {
                return Number(value) * Number(rate);
            }
            return 0;
        };
        this.convertFromDollars = (currency, value) => {
            const rate = this.rates.get(currency);
            if (rate) {
                const result = Number(value) / Number(rate);
                return this.roundedNumber(result, 1);
            }
            return 0;
        };
    }
}
const convertService = new ConvertService();
exports.convertService = convertService;
