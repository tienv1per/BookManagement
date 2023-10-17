const book = require('../models/book.model');
const publisherController = require('../controllers/publisher.controller');
const authorController = require('../controllers/author.controller');
const categoryController = require('../controllers/category.controller');


exports.getTotalPage = (req, res) => {
    book.find({}, (err, docs) => {
        if(err) {
            console.log(err);
            res.status(500).json({msg: err});
            return; 
        }
        res.status(200).json({ data: parseInt((docs.length - 1)/9) + 1})
    })
}

exports.getAllBook = async (req, res) => {
    if ((typeof req.body.page === 'undefined')){
        res.status(422).json({msg: 'Invalid data'});
        return;
    }

    // khoang gia
    let range = null;
    let objRange = null;
    if(typeof req.body.range !== 'undefined'){
        range = req.body.range;
        objRange = range;
    }

    //search
    let searchText = "";
    if(typeof req.body.searchtext !== 'undefined'){
        searchText = req.body.searchtext;
    }
    let searchPublisher = null;
    searchPublisher = await publisherController.getIDBySearchText(searchText);
    let searchAuthor = null;
    searchAuthor = await authorController.getIDBySearchText(searchText);
    let searchCategory = null;
    searchCategory = await categoryController.getIDBySearchText(searchText);
    
    // sort
    let sortType = "release_date";
    let sortOrder = "-1";
    if(typeof req.body.sorttype !== 'undefined'){
        sortType = req.body.sorttype;
    }
    if(typeof req.body.sortorder !== 'undefined'){
        sortOrder = req.body.sortorder;
    }
    if((sortType !== "price") && (sortType !== "release_date")
    && (sortType !== "view_counts")
    && (sortType !== "sales")
    ){
        res.status(422).json({msg: 'Invalid sort type'});
        return;
    }
    if((sortOrder !== "1")
    && (sortOrder !=="-1")){
    res.status(422).json({msg: "Invalid sort order"});
    }

    // page and total page
    let bookCount = null;
    try {
        if(range !== null) {

            bookCount = await book.count({sort: [{name: new RegExp(searchText, "i") }, { id_nsx: {$in: searchPublisher }}, {id_author: {$in: searchAuthor }}, {id_category: {$in: searchCategory}}], price: {$gte: objRange.low, $lte: objRange.high }});

        }else {
            bookCount = await book.count({ $or: [{ name: new RegExp(searchText, "i") }, { id_nsx: { $in: searchPublisher } }, { id_author: { $in: searchAuthor } }, { id_category: { $in: searchCategory } }] });

        }
    }
    catch(err) {
        res.status(500).json({msg: err});
        return;
    }
    let totalPage = parseInt(((bookCount - 1) / 9) + 1);
    let { page } = req.body;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }
}