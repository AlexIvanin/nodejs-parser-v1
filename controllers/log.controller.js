const Log = require('../models/log');
const Product = require('../controllers/product.controller');
const Variant = require('../controllers/variant.controller');

var app;

async function start(site) {
    let newLogStart = new Log({ site: site });
    app = await newLogStart.save();
}

function finishSuccessfully() {
    return app.finish().successfully().save();
}

function finishWithError() {
    return app.finish().withErrors().save();
}

function markProductsAsDeleted() {
    return Product.markAsDeleted(app.begin);
}

function markVariantsAsDeleted() {
    return Variant.markAsDeleted(app.begin);
}

module.exports = {
    start,
    markProductsAsDeleted,
    markVariantsAsDeleted,
    finishWithError,
    finishSuccessfully
};