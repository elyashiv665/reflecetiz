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
var amqp = require("amqplib");
var models_js_1 = require("./mongo/models.js");
var mongoose_1 = require("mongoose");
// Connect to MongoDB database
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
function declareQueue(channel, queueName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, channel.assertQueue(queueName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function publishToQueue(channel, queueName, message) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, channel.sendToQueue(queueName, Buffer.from(message))];
                case 1:
                    _a.sent();
                    console.log('Task published to the queue.');
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error("failed to update for ".concat(queueName, " and task: ").concat(message) + err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function publishUpdateData(channel, updateDataQueueName) {
    return __awaiter(this, void 0, void 0, function () {
        var services, unixTime, index, _i, services_1, service, query, domainsToUpdate, tasks, err_2, packageDomains, i, task, promises;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    services = JSON.parse(process.env.SERVICES);
                    unixTime = Math.floor(Date.now());
                    index = 0;
                    _i = 0, services_1 = services;
                    _c.label = 1;
                case 1:
                    if (!(_i < services_1.length)) return [3 /*break*/, 8];
                    service = services_1[_i];
                    query = {
                        $or: [
                            (_a = {}, _a["lastUpdated.".concat(service)] = 0, _a),
                            (_b = {}, _b["lastUpdated.".concat(service)] = { $gt: unixTime - parseFloat(process.env.MAX_UPDATE_DAYS) }, _b)
                        ]
                    };
                    domainsToUpdate = [];
                    tasks = [];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, models_js_1["default"].find(query, { _id: 1 })];
                case 3:
                    domainsToUpdate = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _c.sent();
                    console.error('failed to query domains. ', err_2);
                    return [2 /*return*/];
                case 5:
                    packageDomains = [];
                    while (domainsToUpdate.length) {
                        for (i = 0; i < parseInt(process.env.TASKS_PAGGING_UPDATE_DATA) && domainsToUpdate.length > 0; i++) {
                            if (domainsToUpdate.length > 0) {
                                packageDomains.push(domainsToUpdate.pop());
                            }
                        }
                        task = {
                            id: "".concat(service, " updateData ").concat(index),
                            data: {
                                domains: packageDomains,
                                service: service
                            }
                        };
                        tasks.push(task);
                    }
                    promises = tasks.map(function (task) { return publishToQueue(channel, updateDataQueueName, JSON.stringify(task)); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 6:
                    _c.sent();
                    index++;
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function handler() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, channel, existUpdateDataQueue, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, connect()];
                case 1:
                    connection = _a.sent();
                    return [4 /*yield*/, createChannel(connection)];
                case 2:
                    channel = _a.sent();
                    return [4 /*yield*/, channel.assertQueue(process.env.UPDATE_DATA_QUEUE_NAME)];
                case 3:
                    existUpdateDataQueue = _a.sent();
                    if (!!existUpdateDataQueue) return [3 /*break*/, 5];
                    return [4 /*yield*/, declareQueue(channel, process.env.UPDATE_DATA_QUEUE_NAME)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [4 /*yield*/, publishUpdateData(channel, process.env.UPDATE_DATA_QUEUE_NAME)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, channel.close()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, connection.close()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
setInterval(handler, 15000);
// setInterval(handler, parseInt(process.env.JOB_MANAGER_INTERVAL)); 
// handler() 
