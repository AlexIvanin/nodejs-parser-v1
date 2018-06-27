const Product = require('../models/product');

function markAsDeleted(appBeginTime) {
    return Product.updateMany({updatedAt: {$lt: appBeginTime}},  {'deleted': true}).exec();
}

module.exports = {
    markAsDeleted
};