var ENV = require('dotenv').load().parsed;
var fs = require("fs");
const log = require('cllc')();
var es = require("event-stream");
var jsoncsv = require('json-csv');
const List = require('./../controllers/list.controller.js');
const ListModel = require('../models/list.js')

async function run() {

        log.start('Parsing Products to CSV');
        
        var out = fs.createWriteStream("data/file.csv", {
            encoding: 'utf8'
        })
        var products = await ListModel.find({});

        var options = {
            fields: [
                {
                    name: 'id',
                    label: 'Id'
                },
                {
                    name: 'name',
                    label: 'Name'
                },
                {
                    name: 'price',
                    label: 'Price'
                },
                {
                    name: 'catOrder',
                    label: 'Cat Order'
                },
                {
                    name: 'catTwoorder',
                    label: 'Cat Twoorder'
                },
                {
                    name: 'grorder',
                    label: 'Grorder'
                },
                {
                    name: 'url',
                    label: 'Url'
                },
                {
                    name: 'image',
                    label: 'Image'
                },
                {
                    name:'images',
                    label:'Images'
                },
                {
                    name:'imageBrand',
                    label:'Image Brand'
                },
                {
                    name:'description',
                    label:'Description'
                },
                {
                    name:'sizing',
                    label:'Sizing'
                },
                {
                    name:'descrSizing',
                    label:'Descriptions Sizing'
                },
                {
                    name:'brandName',
                    label:'Brand Name'
                },
                {
                    name:'SKU',
                    label:'SKU'
                },
                {
                    name:'COLOR',
                    label:'COLOR'
                },
                {
                	name:'productCategory',
                	label:'productCategory'
                },
                {
                	name:'productCategoryTree',
                	label:'productCategoryTree'
                }
            ],
            fieldSeparator: ';'
        
        }
        var readable = es.readArray(products)
        readable
            .pipe(jsoncsv.csv(options))
            .pipe(out)
            log.finish('Products parsing to file data/file.csv');
      


}

module.exports = {
    run
};