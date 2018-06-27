var ENV = require('dotenv').load().parsed;
const cheerio = require('cheerio');
const log = require('cllc')();
const needle = require('needle');
needle.get('https://www.sil.lt/clothes/hoodies/converse-essentials-lightweight-cropped-palm-print-star-pullover-hoodie-10006139-a01.html', function(error, response) {
  
var $ = cheerio.load(response.body);


var productHtml = $('.pr_productview');


var leftFront = productHtml.find('.pr_imageholder');
var rightFront = productHtml.find('.pr_descholder');



var imagesCopy = leftFront.find('.pr_thubWrapInner').children('a');


var imagesFull = [];

imagesCopy.each( function (i, elem){
    var a = $(this);
    var img = a.attr('href');
    if (img){
        imagesFull.push(img);
    }

})
var imageBrand = rightFront.children('.pr_titleWrap').children('.prTitleLeft').children('a').attr('style')
var brand = rightFront.children('.pr_shortInfo')
var description = productHtml.children('.main').find('.pr_tab_info').first().html();
var itemsAnalogProducts = [];

var id = productHtml.attr('data-productid');
var sizing = rightFront.children('.buy-product').find('#chooseSize').html();
var descrSizing = productHtml.children('.main').find('#t10-info').html();
var brandName = rightFront.find('.pr_shortInfo').find('tr').first().children('td').last ().text();
var SKU = rightFront.find('.pr_shortInfo').find('tr').first().next().children('td').last().text();
var COLOR = rightFront.find('.pr_shortInfo').find('tr').last().children('td').last().text();
var footerMenu = $(".footerMenuWrap").find('.topMenuItem.active').text();

needle('get','https://www.sil.lt/application/modules/products/ajax/getSimilarProducts.php?lang=2&productID=' + id).then(function(html) {
    let $ = cheerio.load(html.body);
    var items = [];
    var itemsPrItem = $(".pr_item");
    
     itemsPrItem.each( async function (i, elem) {
            var a = $(this).prev();
            var name = a.children('a.pr_name').text().replace(/\s{2,}/g, "");
            var price = a.children('.priceLabel').text().replace(/[^-0-9]/gim, '');
            var productId = a.attr('id');
            var url = a.children('a.pr_name').attr('href');
            var image = a.children('.photoHolder ').children('a').children('img').attr('src');
            if (name){
                await items.push({
                    name: name,
                    price: price,
                    id: productId,
                    url: url,
                    image: image
                });
            }
        });


        let parsedObject = {
            id:id,
            images:imagesFull,
            imageBrand:imageBrand,
            description:description,
            sizing:sizing,
            descrSizing:descrSizing,
            brandName:brandName,
            SKU:SKU,
            itemsAnalogProducts:items,
            COLOR:COLOR,
            productCategoryTree:footerMenu
        
        };
        console.log(parsedObject);


  })
  .catch(function(err) {
   
  })
   



});

