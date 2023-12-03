
const book = require('../models/book.model');
const publisherController = require('../controllers/publisher.controller');
const authorController = require('../controllers/author.controller');
const categoryController = require('../controllers/category.controller');
const nsxController = require('../controllers/nsx.controller');
exports.getTotalPage = (req, res) => {
    book.find({}).exec()
        .then(docs => {
            res.status(200).json({ data: parseInt((docs.length - 1) / 9) + 1 });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ msg: err });
        });
};

exports.getAllBook = async (req, res) => {
    //Search Text
    let searchText = "";
    if (typeof req.query.searchtext !== 'undefined') {
        searchText = req.query.searchtext;
    }


    let searchAuthor = "";
    if (typeof req.query.author !== 'undefined') {
        searchAuthor = req.query.author;
        searchAuthor = await authorController.getIDBySearchText(searchAuthor);
    }

    let searchCategory = "";
    if (typeof req.query.category !== 'undefined') {
        searchCategory = req.query.category;
        searchCategory = await categoryController.getIDBySearchText(searchCategory);
    }

    let searchnsx = "";
    if (typeof req.query.nsx !== 'undefined') {
        searchnsx = req.query.nsx;
        searchnsx = await nsxController.getIDBySearchText(searchnsx);
    }


    let bookCount = null;
     try {
    //     if (range !== null) {
            bookCount = await book
                .count({ $or: [{ name: new RegExp(searchText, "i") }, { id_nsx: { $in: searchnsx } }, { id_author: { $in: searchAuthor } }, { id_category: { $in: searchCategory } }, { name: { $in: searchText } }] });
         }
    //     else {
    //         bookCount = await book.count({ $or: [{ name: new RegExp(searchText, "i") }, { id_nsx: { $in: searchnsx } }, { id_author: { $in: searchAuthor } }, { id_category: { $in: searchCategory } }] });
    //     }
    // }
    catch (err) {
        res.status(500).json({ msg: err });
       return;
    }
 
        var query = {
            $and: [
            ]
          };
          if (searchText !== undefined && searchText !== "") {
            query.$and.push({ name: searchText });
          }

          if (searchAuthor !== undefined && searchAuthor !== "") {
            query.$and.push({ id_author: searchAuthor });
          }
          
          if (searchCategory !== undefined && searchCategory !== "") {
            query.$and.push({ id_category: searchCategory });
          }
          
          if (searchnsx !== undefined && searchnsx !== "") {
            query.$and.push({ id_nsx: searchnsx });
          }
          Object.keys(query).forEach(key => query[key] === "" && delete query[key]);

            book
                .find(query)
                .lean()
                .then(docs => {
                res.status(200).json({ data: docs });
                })         
            .catch(err => {
            console.log(err);
            res.status(500).json({ msg: err });
            });
        }



exports.getBookByID = async (req, res) => {
    if (req.query.id === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }

    let result;
    try {
        result = await book.findById(req.params.id);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }

    if (result === null) {
        res.status(404).json({ msg: "not found" });
        return;
    }

    // Tăng giá trị của view_counts
    result.view_counts = result.view_counts + 1;

    try {
        // Sử dụng async/await để đợi cho việc save
        await result.save();
        res.status(200).json({ data: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
    }
};


// find book có liên quan đến author, category
exports.getRelatedBook = async (req, res) => {
    if (typeof req.params.bookId === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }

    let { bookId } = req.params;
    let bookObj = null;

    try {
        bookObj = await book.findById(bookId);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }

    if (bookObj === null) {
        res.status(200).json({ data: [], msg: 'Invalid bookId' });
        return;
    }

    try {
        const docs = await book
            .find({
                $or: [
                    { $and: [{ id_category: bookObj.id_category }, { _id: { $nin: [bookId] } }] },
                    { $and: [{ id_author: bookObj.id_author }, { _id: { $nin: [bookId] } }] }
                ]
            })
            .limit(5)
            .sort({ release_date: -1 });

        res.status(200).json({ data: docs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
    }
};
