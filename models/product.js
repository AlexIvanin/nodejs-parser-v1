const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProductSchema = new Schema(
    
    {
    
    "id": {
        type: Number, unique:true
    },
    "url": {
        type: String
    },
    "name": {
        type: String, unique:false
    },
    "price": {
        type: Number, unique:false
    },
    "idProduct": {
        type: Number, unique:false
    },
    "catOrder": {
        type: Number , unique:false
    },
    "catTwoorder": {
        type: Number, unique:false
    },
    "grorder": {
        type: Number, unique:false
    },
    "image": {
        type: String, unique:false
    },
    "images": {
        type: String, unique:false
    }

    });
module.exports = mongoose.model('Product', ProductSchema);