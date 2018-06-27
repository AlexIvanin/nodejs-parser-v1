const mongoose = require('mongoose');
const VariantSchema = require('./schema/variant.schema');

module.exports = mongoose.model('Variant', VariantSchema);