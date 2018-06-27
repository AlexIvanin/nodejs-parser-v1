const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

module.exports = function(config) {

    mongoose.connect(config.db);
    mongoose.set('debug', true)
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error...'));
    db.once('open', function callback() {
        console.log('database connection opened')
    });

    return mongoose;
};