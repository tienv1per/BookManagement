const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const nsx = new Schema({
    name: {
        type: String,
        require: true
    }
});
module.exports = mongoose.model('nsx', nsx);
