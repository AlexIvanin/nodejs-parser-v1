const List = require('../models/list');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
var fs = require("fs");
var es = require("event-stream");
var jsoncsv = require('json-csv');

async function add(productList = []) {

    return new Promise((resolve, reject) => {

        if(productList.length == 0)
            return;

            productList.forEach(function (i, elem) {
                if (i.name != ''){
                    var kitty = new List(
                        { 
                            name: i.name,
                            price: i.price,
                            idProduct: i.id,
                            catOrder: i.catOrder,
                            catTwoorder: i.catTwoorder,
                            grorder: i.grorder,
                            url: i.url,
                            image: i.image,
                            productCategory:i.productCategory
        
                         }
                    );
                    kitty.save();
                    resolve(elem)
                }
               
            })

        

           
        // List.collection.insert(productList, function(err, docs) {

        //     if(err)
        //         reject(err);

        //     resolve(docs);
        // });
    });
}

function clear() {
    return List.remove({});
}


function count(condition = {}) {
    return List.count(condition).exec();
}
async function update(productID, updated) {

    List.findOne({idProduct: parseInt(productID)}, function(err, doc) {
        
        if (updated.descrSizing &&  updated.descrSizing != null && updated.descrSizing != '' && updated.descrSizing != undefined){
            doc.descrSizing = updated.descrSizing;
        }
        if (updated.imageBrand){
            doc.imageBrand = updated.imageBrand;
        }
        if (updated.description){
            doc.description = updated.description;
        }
        if (updated.sizing){
            doc.sizing = updated.sizing;
        }
        if (updated.brandName){
            doc.brandName = updated.brandName;
        }
        if (updated.SKU){
            doc.SKU = updated.SKU;
        }
        if (updated.images &&  updated.images != null && updated.images != '' && updated.images != undefined ){
            doc.images = updated.images;
        }
        if (updated.COLOR){
            doc.COLOR = updated.COLOR;
        }
        if (updated.productCategoryTree){
            doc.productCategoryTree = updated.productCategoryTree;
        }
        if (productID){
            doc.save();
        }
        
    });
   
          
   
  
}
 function findAll(){
     var array = [];
     List.find({},  function(err, users) {
       array = users;
      });
      return array;
}
function find(condition = {}) {
    return List.find(condition);
}

module.exports = {
    add,
    clear,
    count,
    find,
    update,
    findAll
};