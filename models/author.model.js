const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const author = new Schema({
    name: {
        type: String,
        require: true
    }
});
module.exports = mongoose.model('author', author);