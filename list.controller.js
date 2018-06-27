const List = require('../models/list');

async function add(productList = []) {

    return new Promise((resolve, reject) => {

        if(productList.length == 0)
            return;

        List.collection.insert(productList, function(err, docs) {

            if(err)
                reject(err);

            resolve(docs.result.n);
        });
    });
}

function clear() {
    return List.remove({});
}


function count(condition = {}) {
    return List.count(condition).exec();
}

function find(condition = {}) {
    return List.find(condition);
}

module.exports = {
    add,
    clear,
    count,
    find
};