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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var models_1 = require("./mongo/models");
var express = require('express');
// Connect to MongoDB database
mongoose_1["default"]
    .connect('mongodb://mongo/domains')
    .then(function () { return console.log('Connected to MongoDB'); })["catch"](function (error) { return console.error('Error connecting to MongoDB:', error); });
var app = express();
var port = 3000;
var services = JSON.parse(process.env.SERVICES);
app.use(express.json());
function isValidDomain(domain) {
    var domainPattern = /^[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
    return domainPattern.test(domain);
}
function createDomain(url) {
    return __awaiter(this, void 0, void 0, function () {
        var data, lastUpdated, newDomain, _res, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = {};
                    lastUpdated = {};
                    services.forEach(function (service) {
                        data.service = 'undefined';
                        lastUpdated[service] = 0;
                    });
                    newDomain = new models_1["default"]({
                        url: url,
                        data: data,
                        lastUpdated: lastUpdated
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, newDomain.save()];
                case 2:
                    _res = _a.sent();
                    console.log(_res.url + " saved to domains collection.");
                    return [2 /*return*/, { statusCode: 200, body: _res }];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [2 /*return*/, { statusCode: 500, message: "Error while adding domain!" }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
app.post('/domains', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var existingDomain, createdDomain;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!((_a = req.body) === null || _a === void 0 ? void 0 : _a.url)) {
                    console.error('No url specified');
                    res.json({
                        statusCode: 400,
                        message: 'No url specified'
                    });
                }
                return [4 /*yield*/, models_1["default"].findOne({ url: req.body.url })];
            case 1:
                existingDomain = _b.sent();
                if (existingDomain) {
                    res.json({
                        statusCode: 400,
                        message: 'Domain already exists'
                    });
                    return [2 /*return*/];
                }
                if (!isValidDomain(req.body.url)) {
                    res.json({
                        statusCode: 401,
                        message: 'Domain pattern invalid'
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, createDomain(req.body.url)];
            case 2:
                createdDomain = _b.sent();
                res.json(createdDomain);
                return [2 /*return*/];
        }
    });
}); });
app.get('/domains/:url', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var url, domain_1, _res, unixTime_1, data_1, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("start get domain on:", req.params.url);
                url = req.params.url;
                if (!url || !isValidDomain(url)) {
                    res.json({
                        statusCode: 401,
                        message: 'Domain pattern invalid'
                    });
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, models_1["default"].findOne({ url: url })];
            case 2:
                domain_1 = _a.sent();
                if (!!domain_1) return [3 /*break*/, 4];
                console.log("".concat(url, " not found, creating new one"));
                return [4 /*yield*/, createDomain(url)];
            case 3:
                _res = _a.sent();
                _res.message = "".concat(url, " not found. new domain created, please check later for data about this domain.");
                res.json(_res);
                return [2 /*return*/];
            case 4:
                unixTime_1 = Math.floor(Date.now());
                data_1 = {};
                services.forEach(function (service) {
                    var isExpired = domain_1.lastUpdated[service] > unixTime_1 - parseFloat(process.env.MAX_UPDATE_DAYS);
                    if (!isExpired) {
                        var decodedString = Buffer.from(domain_1.data[service], 'base64').toString('utf8');
                        data_1[service] = decodedString;
                    }
                });
                if (Object.keys(data_1).length) {
                    res.json(data_1);
                }
                else {
                    res.status(500).json({ message: 'no data available, please check later for data about this domain.' });
                }
                return [3 /*break*/, 6];
            case 5:
                err_2 = _a.sent();
                console.error(err_2);
                res.status(500).json({ message: 'Error while querying domain' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
