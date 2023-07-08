"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var services = JSON.parse(process.env.SERVICES);
var domainSchema = new mongoose_1["default"].Schema({
    url: { type: String, require: true },
    data: services.reduce(function (obj, str) {
        obj["".concat(str)] = { type: String };
        return obj;
    }, {}),
    lastUpdated: {
        _id: false,
        type: services.reduce(function (obj, str) {
            obj["".concat(str)] = { type: Number, "default": 0 };
            return obj;
        }, {})
    }
});
try {
    services.forEach(function (service) {
        var _a;
        return domainSchema.index((_a = {}, _a["lastUpdated.".concat(service)] = 1, _a));
    });
}
catch (error) {
    console.error('Error creating index:', error);
}
;
exports["default"] = mongoose_1["default"].model('Domain', domainSchema);
