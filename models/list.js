var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ListSchema = new Schema(
    
    {
    
    "url": {
        type: String, unique:true
    },
    "name": {
        type: String, unique:false,default: ''
    },
    "price": {
        type: String, unique:false,default: ''
    },
    "idProduct": {
        type: String, unique:false,default: ''
    },
    "catOrder": {
        type: String , unique:false,default: ''
    },
    "catTwoorder": {
        type: String, unique:false,default: ''
    },
    "grorder": {
        type: String, unique:false,default: ''
    },
    "image": {
        type: String, unique:false,default: ''
    },
    "images": {
        type: String, unique:false,default: ''
    },
    "imageBrand": {
        type: String, unique:false,default: '', index:false
    },
    "description": {
        type: String, unique:false,default: '', index:false
    },
    "sizing": {
        type: String, unique:false,default: '', index:false 
    },
    "descrSizing": {
        type: String, unique:false,default: '', index:false 
    },
    "brandName": {
        type: String, unique:false,default: '', index:false 
    },
    "SKU": {
        type: String, unique:false,default: '', index:false 
    },
    "itemsAnalogProducts":{
        type: String, unique:false, default: '', index:false
    },
    "COLOR": {
        type: String, unique:false,default: '', index:false 
    },
    "productCategory":{
        type:String, unique:false, default:''
    },
    "productCategoryTree":{
        type:String, unique:false, default:''
    }
    },{
        autoIndex : false 
    });
module.exports = mongoose.model('List', ListSchema);
