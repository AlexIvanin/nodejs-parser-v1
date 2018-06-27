const mongoose = require('mongoose');

var VariantSchema = require('./commonProduct.schema.js').clone();

//VariantSchema.add({"parentId": {type: String}});
VariantSchema.add({"vprop": {type: mongoose.Schema.Types.Mixed}});

VariantSchema.statics.getProductByVin = async function(parsedData) {
    let product = await mongoose.model('Product').findOne({id: parsedData.parentId}).exec();
    if(!product) {
        product = mongoose.model('Product').create({
            id: parsedData.parentId,
            name: parsedData.name,
            category: parsedData.category,
            manufacturer: parsedData.manufacturer
        });
    }

    return product;
};

VariantSchema.statics.findById = async function(id) {
    let product = await mongoose.model('Product').findOne({"variants.id": id}).exec();

    if(!product) return null;

    return new this(product.variants.filter(variant => variant.id == id)[0]);
};

VariantSchema.statics.update = async function(newVariant) {

    newVariant.deleted = false;
    newVariant.updatedAt = new Date();
    
    let product = await mongoose.model('Product').findOne({"variants.id": newVariant.id}).exec();
    
    const newVariants = product.variants.map((variant) => {
        if(variant.id == newVariant.id) {
           return newVariant;
        }
        return variant;
    });
    
    product.deleted = false;
    product.variants = newVariants;
    
    await product.save();
};

module.exports = VariantSchema;