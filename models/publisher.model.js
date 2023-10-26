const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const publisher = new Schema( {
    name: {
        type: String,
        require: true
    }
});
module.exports = mongoose.model('publisher', publisher);
