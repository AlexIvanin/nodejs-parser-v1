var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppSchema = new Schema({
    "site": { type: String, required: true },
    "begin": { type: Date, default: Date.now },
    "end": { type: Date },
    "success": { type: Boolean, default: false }
});

AppSchema.methods.finish = function() {
    this.set({end: new Date()});
    return this;
};

AppSchema.methods.withErrors = function() {
    this.set({success: false});
    return this;
};

AppSchema.methods.successfully = function() {
    this.set({success: true});
    return this;
};

module.exports = mongoose.model('Log', AppSchema);