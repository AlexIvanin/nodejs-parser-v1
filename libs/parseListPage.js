var ENV = require('dotenv').load().parsed;

const cheerio = require('cheerio');
const log = require('cllc')();
const tress = require('tress');

const needle = require('needle');
const List = require('./../controllers/list.controller.js');

var queueList;

function run() {
    return new Promise(async (resolve, reject) => {
        log.start('Pages handled %s, products found %s');

        //await List.clear();
        
        //initialize query with callback "requestProductList"
        // run it N parallel streams
        queueList = tress(requestProductList, ENV.PARALLEL_STREAMS); 

        //add all pages to query
        let pagesCount = await getPagesCount();
        for(let pageNum = 1; pageNum <= pagesCount; pageNum++) {
            queueList.push('/facetsearch?PageSize='+ENV.PAGE_SIZE+'&PageIndex='+pageNum);
        }

        queueList.drain = function () {
            log.finish();
            log.i('...completed!');
            resolve(true);
        };

        queueList.retry = function () {
            queueList.pause();
            // this - task returned to the turn
            log.i('Paused on:', this);
            setTimeout(() => {
                queueList.resume();
                log.i('Resumed');
            }, ENV.TIME_WAITING); // N minutes waiting
        };
    });

}

function getPagesCount() {
    return getFacetProductCount('/facetsearch')
        .then((facetProductCount) => {
            return Math.ceil(facetProductCount / ENV.PAGE_SIZE);
        });
}

function getFacetProductCount(url = '/facetsearch') {

    return needle('get', ENV.URL + url, {cookies: cookieKrollcorp})
        .then(function(response) {
            let $ = cheerio.load(response.body),
                facetPager = $('.pr_item');
                console.log(facetPager.lenght)
            return Number.parseInt(facetPager.length);
        })
        .catch(function(err) {
            log.w((err || res.statusCode) + ' - ' + url);
        });
}

function requestProductList(url, callback) {

    //process requested url
    needle.get(
        ENV.URL + url,
        {cookies: cookieKrollcorp},
        async function(err, res) {

            if (err || res.statusCode !== 200) {
                log.w((err || res.statusCode) + ' - ' + url);
                return callback(true); // return url at the beginning of th e turn
            }

            try {
                let productList = parseProductList(res.body);
                let productsCount = await List.add(productList);

                log.step(1, productsCount);
                callback(); //this callback for tress query at the end of iteration
            }
            catch(err) {
                log.w(err);
                //if any error retry
                return callback(true);
            }
        });
}

function parseProductList(html_page) {

    let $ = cheerio.load(html_page),
        productListHtml = $('#products'),
        productList = [];

    productListHtml.find('.searchresults').each((i, el) => {
        productList.push({
            url: $(el).find('.productHeader').find('a').attr('href')
        });
    });

    return productList;
}

module.exports = {
    run
};