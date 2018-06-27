var ENV = require('dotenv').load().parsed;
const cheerio = require('cheerio');
const log = require('cllc')();
const needle = require('needle');

module.exports = function(url, html_page) {
    
    var $ = cheerio.load(html_page),
        productHtml = $('#productpage'),
        variants;
    
    function ajaxPostVariantData(variants) {

        let  postVariantData = {
            productbvin: getParentId()
        };

        Object.keys(variants).forEach((optName) => {
            postVariantData[optName] = variants[optName].value;
        });

        return postVariantData;
    }

    function ajaxRequest(variants) {

        return new Promise((resolve, reject) => {
            needle.post(
                ENV.KROLLCORP_URL + '/products/validate',
                ajaxPostVariantData(variants),
                {cookies: cookieKrollcorp},
                async function (err, res) {

                    if (err || res.statusCode !== 200) {
                        log.w((err || res.statusCode) + ' - ' + url);
                        reject(err);
                    }

                    resolve(res.body);
                });
        });
    }

    function parseVariant(parsedEntity, ajaxResponce) {

        parsedEntity.codes = {
            "upc": ajaxResponce.UPCCode,
            "seller-sku": ajaxResponce.Sku,
            "mfg-sku": ajaxResponce.ManufacturerPartNumber
        };

        parsedEntity.prop = {
            "isHazardous": ajaxResponce.IsHazmat,
            "countryofOrigin": ajaxResponce.CountryOfOrigin.trim(),
            "productWeight": ajaxResponce.Weight,
            "mapPrice": ajaxResponce.MAPPrice
        };

        parsedEntity.price = parseFloat(cheerio.load(ajaxResponce.Price)('.choice').last().text().replace(/\$/g, ""));
        parsedEntity.qty = ajaxResponce.StockMessage.replace(/Quantity In Stock: /g, "");
        parsedEntity.images = [ajaxResponce.ImageUrl];
        parsedEntity.sdesc = ajaxResponce.ShortDescription;

        return parsedEntity;
    }

    function formatVariantProps(variants) {

        let vprop = {};

        Object.keys(variants).forEach((optName) => {
            vprop[variants[optName].name] = variants[optName].textValue;
        });

        return vprop;
    }

    function getId() {
        return url.split('/').pop();
    }

    function getParentId() {
        return productHtml.find('#productbvin').val() || null;
    }

    return {
        /**
         * parse variant props from html page
         * @param html_page
         * @returns {*}
         */
        getVariants: function () {

            if(typeof variants === 'undefined') {

                variants = {};
                //get all prop names of variant dropdowns
                let vpropsNames = productHtml.find('.isoption').map(function(i, el) {
                    return $(this).attr('name');
                }).get();

                if(vpropsNames.length > 0) {
                    /**
                     * get values of selected options from plain script in html, like this:
                     * $('#opt484540533B9B44D99681EDCC402E2C0F').val('4421CDF27DE24924B3DFB0258F3084FC');
                     * $('#opt55D027C418F14A0AB56E078E0AC981BC').val('6CD753FAC70A4A83BF574B8E3D74B833');
                     * etc
                     */
                    vpropsNames.forEach((vpropName) => {

                        let labelFor = vpropName.replace('opt', '');

                        let variant = {
                            name: $('label[for="' + labelFor + '"]').text()
                        };

                        let nov_reg = new RegExp("\\$\\('#" + vpropName + "'\\).val\\('(.*)'\\);");
                        let vpropValue = html_page.match(nov_reg);

                        if (!!vpropValue && vpropValue.length > 1) {
                            variant['value'] = vpropValue[1];
                            variant['textValue'] = $('option[value="' + variant['value'] + '"]').text();
                        }

                        variants[vpropName] = variant;
                    });

                } else {
                    variants = null;
                }
            }

            return variants;
        },

         parseProductPage: async function () {

             const breadcrumbs = [];

             //parse breadcrumbs and avoid 0 => Home and 1 => Products breadcrumb elements
             productHtml.find('.breadcrumbs').find('.links').find('a')
                 .not((i, el) => [0, 1].includes(i))
                 .each((i, el) => {
                     breadcrumbs.push($(el).text());
                 });

            let parsedObject = {
                "id": getId(),
                "url": url,
                "category": breadcrumbs.join('/'),
                "name":  productHtml.find('h1').find('span').text(),
                "manufacturer": productHtml.find('.actioncolumn').find('h2').text(),
                "codes": {
                    "upc": productHtml.find('#upcCode').text(),
                    "seller-sku": productHtml.find('#sku').text(),
                    "mfg-sku": productHtml.find('#manufacturerPartNumber').text()
                },
                "qty": parseInt(productHtml.find('.stockdisplay').text().replace(/Quantity In Stock: /g, "")),
                "price": parseFloat(productHtml.find('#pricewrapper').find('.choice').last().text().replace(/\$/g, "")),
                "prop":{
                    "isHazardous": productHtml.find('#isHazardous').text(),
                    "countryofOrigin": productHtml.find('#countryofOrigin').text().trim(),
                    "productWeight": productHtml.find('#productWeight').text(),
                    "mapPrice": productHtml.find('#mapPrice').text()
                },
                "images": [
                    productHtml.find('#imgMain').attr('src')
                ],
                "sdesc": productHtml.find('#shortdescription').html(),
                "desc": productHtml.find('.productdescription').map((i, el) => '<p>' + $(el).text().trim() + '</p>').get().join('')
            };

            let variants = this.getVariants();
            if(!!variants) {
                let ajaxResponse = await ajaxRequest(variants);

                parsedObject = parseVariant(parsedObject, ajaxResponse);
                parsedObject.parentId = getParentId();
                parsedObject.vprop = formatVariantProps(variants);
            }

            return parsedObject;
        }
    }
};