const mongoose = require('mongoose');
const hash = require('object-hash');

let commonProductSchema = new mongoose.Schema({
    "id": {type: String, required: true},
    "url": {type: String},
    "category": {type: String},
    "name": {type: String},
    "manufacturer": {type: String},
    "codes": {
        "upc": {type: String},
        "seller-sku": {type: String},
        "mfg-sku": {type: String}
    },
    "qty": {type: Number},
    "price": {type: Number},
    "prop":{
        "isHazardous": {type: String},
        "countryofOrigin": {type: String},
        "productWeight": {type: String},
        "mapPrice": {type: String}
    },
    "images": {type: Array},
    "sdesc": {type: String},
    "desc": {type: String},
    "hash": {type: String},
    "deleted": {type: Boolean, default: false}
}, {
    timestamps: { createdAt: false },
    usePushEach: true
});

commonProductSchema.pre('save', function(next) {
    this.hash = this.getHash();
    next();
});

commonProductSchema.methods.hasChanged = function(newHash) {
    return this.hash !== newHash;
};

commonProductSchema.methods.getHash = function() {
    if(typeof this.hash === 'undefined')
        this.createHash();

    return this.hash;
};

commonProductSchema.methods.createHash = function () {
    let excludedKeys = ['_id', '__v', '_bsontype', 'id', 'url', 'price', 'qty', 'hash', 'updatedAt'];
    this.hash = hash(this.toObject(), {
        ignoreUnknown: true,
        respectFunctionProperties: false,
        respectFunctionNames: false,
        respectType: false,
        excludeKeys: key => excludedKeys.includes(key)
    });
};

module.exports = commonProductSchema;