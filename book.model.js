
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const book = new Schema({
    id_category: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
    price: {
        type: Number,
        required: true,
    },
    release_date: {
        type: Date,
        $dateToString: { format: "%Y-%m-%d", date: "$date" },
        default: new Date()
    },
    img: {
        type: String,
        required: true,
    },
    describe: {
        type: String,
        default: "",
    },
    id_nsx: {
        type: String,
        required: true,
    },
    id_author: {
        type: String,
        required: true,
    },
    view_counts: {
        type:Number,
        default: 0, 
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    },
    sales: {
        type: Number,
        default: 0,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
        }
    }
});
module.exports = mongoose.model('book', book);