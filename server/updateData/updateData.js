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
var models_js_1 = require("./mongo/models.js");
var amqp = require("amqplib");
var axios = require('axios');
var SERVICE_METADATA = JSON.parse(process.env.SERVICES_METADATA);
mongoose_1["default"]
    .connect('mongodb://mongo/domains')
    .then(function () { return console.log('Connected to MongoDB'); })["catch"](function (error) { return console.error('Error connecting to MongoDB:', error); });
function connect() {
    return __awaiter(this, void 0, void 0, function () {
        var connection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, amqp.connect('amqp://rabbitmq')
                        .then(function (_connection) { console.log('Connected to rabbitmq'); connection = _connection; })["catch"](function (error) { return console.error('Error connecting to rabbitmq:', error); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, connection];
            }
        });
    });
}
function createChannel(connection) {
    return __awaiter(this, void 0, void 0, function () {
        var channel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.createChannel()
                        .then(function (_channel) { console.log('createChannel to rabbitmq'); channel = _channel; })["catch"](function (error) { return console.error('Error createChannel to rabbitmq:', error); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, channel];
            }
        });
    });
}
function consumeFromQueue(channel, queueName, callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, channel.consume(queueName, callback, { noAck: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function handleReputationCallback(domain, reputationData, isError, service) {
    return __awaiter(this, void 0, void 0, function () {
        var encodedString, updateOperation, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (isError) {
                        console.log("Error occurred for ".concat(domain.url, ":"));
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    encodedString = Buffer.from(JSON.stringify(reputationData), 'utf8').toString('base64');
                    updateOperation = { $set: (_a = {}, _a["lastUpdated.".concat(service)] = Math.floor(Date.now()), _a["data.".concat(service)] = encodedString, _a) };
                    return [4 /*yield*/, models_js_1["default"].findOneAndUpdate({ url: domain.url }, updateOperation)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error('error updating domain data', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getReputation(domain, service) {
    try {
        var url = SERVICE_METADATA["".concat(service)].url;
        var params = {};
        var headers = {};
        // the api query could be saved in the Global scope, 
        // for simplicity I passed that even though the services is not editable in one place now but here and in the global.
        if (service === 'whoIs') {
            params.domainName = domain.url;
            params.apiKey = SERVICE_METADATA["".concat(service)].apiKey;
            params.outputFormat = 'JSON';
        }
        if (service === 'virusTotal') {
            url += domain.url;
            headers["x-apikey"] = SERVICE_METADATA["".concat(service)].apiKey;
        }
        var promise = axios.get(url, { params: params, headers: headers });
        return promise;
    }
    catch (error) {
        console.error('Error get reputation:', error);
    }
}
function processTask(task) {
    return __awaiter(this, void 0, void 0, function () {
        var unixTime, query, deepDataDomains_1, promises, responses, err_1;
        var _a, _b;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    unixTime = Math.floor(Date.now());
                    query = {
                        $or: [
                            (_a = {}, _a["lastUpdated.".concat(task.data.service)] = 0, _a),
                            (_b = {}, _b["lastUpdated.".concat(task.data.service)] = { $gt: unixTime - parseFloat(process.env.MAX_UPDATE_DAYS) }, _b)
                        ]
                    };
                    return [4 /*yield*/, models_js_1["default"].find(query)];
                case 1:
                    deepDataDomains_1 = _c.sent();
                    promises = deepDataDomains_1.map(function (domain) { return getReputation(domain, task.data.service); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    responses = _c.sent();
                    responses.forEach(function (response, index) { return __awaiter(_this, void 0, void 0, function () {
                        var domain, isError;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    domain = deepDataDomains_1[index];
                                    isError = response instanceof Error;
                                    return [4 /*yield*/, handleReputationCallback(domain, response.data, isError, task.data.service)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _c.sent();
                    console.error(err_1);
                    return [2 /*return*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
;
function pickupTask() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, channel, isQueueEmpty_1, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, connect()];
                case 1:
                    connection = _a.sent();
                    return [4 /*yield*/, createChannel(connection)];
                case 2:
                    channel = _a.sent();
                    isQueueEmpty_1 = false;
                    _a.label = 3;
                case 3:
                    if (!!isQueueEmpty_1) return [3 /*break*/, 5];
                    return [4 /*yield*/, consumeFromQueue(channel, process.env.UPDATE_DATA_QUEUE_NAME, function (message) { return __awaiter(_this, void 0, void 0, function () {
                            var task;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(message !== null)) return [3 /*break*/, 2];
                                        task = JSON.parse(message.content.toString());
                                        return [4 /*yield*/, processTask(task)];
                                    case 1:
                                        _a.sent();
                                        console.log("Consumer started for ".concat(process.env.UPDATE_DATA_QUEUE_NAME));
                                        return [3 /*break*/, 3];
                                    case 2:
                                        isQueueEmpty_1 = true;
                                        console.log("No tasks remaining. Queue is empty.");
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 5: return [4 /*yield*/, channel.close()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, connection.close()];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    console.error('error while updating data', error_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
;
setInterval(pickupTask, parseInt(process.env.UPDATE_DATA_INTERVAL));
