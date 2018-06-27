var ENV = require('dotenv').load().parsed;

const log = require('cllc')();
const needle = require('needle');
const retry = require('retry-as-promised');
const Promise = require('bluebird');

const List = require('./../controllers/list.controller.js');

const Parser = require('./parser');
const Product = require('../models/product');
const ProductFactory = require('./product.factory.js');
const { createProgressBar } = require('./utils');

async function run() {
        
    var queueHandled = 0,
        queueTotal = await List.count(),
        progress = createProgressBar("parse products", queueTotal);
  
    while(queueHandled < queueTotal) {

        let limit = parseInt(ENV.PAGE_SIZE),
            offset = queueHandled,
            productList = await List.find({}).skip(offset).limit(limit).exec();
       
        await Promise.map(productList, async (productQuery) => {

            let stepHandled = 0;

            try {
                let resp = await safeRequest(productQuery.url);
              
                let parser = new Parser(productQuery.url, resp.body);

               stepHandled = await parseProduct(parser);
            }
            catch(err) {
                log.w(err);
            }

            queueHandled += stepHandled;
            progress.tick(stepHandled);
        }, {
            concurrency: 1
        });
    }
}

function safeRequest(url) {

    return retry(function (options) {
            // options.current, times callback has been called including this call
            return requestProduct(url);
        }, {
            max: 3,
            timeout: ENV.TIME_WAITING,
            backoffBase: 500,
            backoffExponent: 1.1,
            match: ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'],
            name: 'requestProduct'
        });
}

/**
 * request product page
 *
 * @param url
 * @return Promise
 */
function requestProduct(url) {
    
    if (typeof url != 'undefined'){
        return needle('get', url, {});
    }

}

function parseProduct(parser) {

    return new Promise(async (resolve, reject) => {

        try {
            let entityModel = ProductFactory.create(parser);
            let parsedData = await parser.parseProductPage();
           
            let newEntity = new entityModel(parsedData);
           
            let product = await List.find({idProduct: newEntity.id});
            await List.update(newEntity.id,parsedData)
                    // if (product.hasChanged(newEntity.getHash())) {
                    //     delete newEntity._doc._id;
                    //     await product.update(newEntity).exec();
                    // } else {
                    //     product.deleted = false;
                    //     product.save()
                    // }
            resolve(1);

        } catch (err) {
            reject(err);
        }
    });
}

function chechResponceStatus(url, responseStatus) {

    let responseStatus = res.statusCode.toString();

    if(responseStatus == 404) {
        resolve(true);
    }

    if(responseStatus.startsWith('30')) {
        url = res.headers.location;
        throw new Error('Status ' + responseStatus + ' on ' + url);
    }

    if (err || responseStatus !== 200) {
        throw new Error(err + ' on ' + url);
    }
}

module.exports = {
    run
};