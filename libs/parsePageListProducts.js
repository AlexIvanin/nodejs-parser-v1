var ENV = require('dotenv').load().parsed;

const cheerio = require('cheerio');
const log = require('cllc')();
const tress = require('tress');
const List = require('./../controllers/list.controller.js');

const needle = require('needle');
var queueList;

function run(url) {
    return new Promise(async (resolve, reject) => {
        //await List.clear();
        log.start('Pages handled %s, products found %s');
        log.i(url)
        queueList = tress(requestProductList, ENV.PARALLEL_STREAMS); 
        let pagesCount = await getFacetProductCount(url);
        for(let pageNum = 1; pageNum <= pagesCount; pageNum++) {
            queueList.push(url + '?vars/page/'+pageNum);
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
function getFacetProductCount(url) {

    return needle('get', url)
        .then(function(response) {
            let $ = cheerio.load(response.body),
                facetPager = $('#pr_PagesHolder a');
            return Number.parseInt(facetPager.last().prev().text());
        })
        .catch(function(err) {
            log.w((err || res.statusCode) + ' - ' + url);
        });
}
function requestProductList(url, callback) {

    //process requested url
    needle.get(
        url,
        async function(err, res) {

            if (err || res.statusCode !== 200) {
                log.w((err || res.statusCode) + ' - ' + url);
                return callback(true); 
            }

            try {
              
                let productList = parseProductList(url,res.body);
                let productsCount = await List.add(productList);

                log.step(1, productList.length);
                callback(); 
            }
            catch(err) {
                log.w(err);
                //if any error retry
                return callback(true);
            }
        });
}
 function parseProductList(url,html_page) {
    log.i('URL - ', url);
    let $ = cheerio.load(html_page),
        productListHtml = $('.pr_item');
        var itemsJson = [];
        productListHtml.each(function (i, elem) {

            var a = $(this).prev();
            var name = a.children('a.pr_name').text().replace(/\s{2,}/g, "");
            var price = a.children('.priceLabel').text().replace(/[^-0-9]/gim, '');
            var productId = a.attr('id');
            var catOrder = a.attr('data-catorder');
            var catTwoorder = a.attr('data-cattwoorder');
            var grorder = a.attr('data-grorder');
            var url = a.children('a.pr_name').attr('href');
            var image = a.children('.photoHolder ').children('a').children('img').attr('src');
            var category = $('.topMenu').children('.active').text();
                itemsJson.push({
                    name: name,
                    price: price,
                    id: productId,
                    catOrder: catOrder,
                    catTwoorder: catTwoorder,
                    grorder: grorder,
                    url: url,
                    image: image,
                    productCategory:category


                });
                
            
        });
    return  itemsJson;
}
module.exports = {
    run
};