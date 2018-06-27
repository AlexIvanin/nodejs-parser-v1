var ProductSchema = require('./commonProduct.schema.js');
const VariantSchema = require('./variant.schema.js').clone();

ProductSchema.add({variants: [VariantSchema]});

ProductSchema.statics.getVariantById = function(id) {
    return this.findOne({"variants.id": id});
};

module.exports = ProductSchema;