const Product = require('../models/product');

function markAsDeleted(appBeginTime) {
    return Product.update({},
        {$set: {"variants.$[variant].deleted": true }},
        {arrayFilters: [{"variant.updatedAt": {$lt: appBeginTime}}], multi: true}
    ).exec();
}

module.exports = {
    markAsDeleted
};