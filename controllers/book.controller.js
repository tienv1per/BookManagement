const { jwtDecode } = require('jwt-decode');

const book = require('../models/book.model');
const commentModel = require("../models/comment");
const publisherController = require('../controllers/publisher.controller');
const authorController = require('../controllers/author.controller');
const categoryController = require('../controllers/category.controller');
const users = require('../models/users');

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
    //Khoang gia
    let range = null;
    let objRange = null;
    if (typeof req.body.range !== 'undefined') {
        range = req.body.range;
        objRange = range;
    }
    //Search Text
    let searchText = "";
    if (typeof req.body.searchtext !== 'undefined') {
        searchText = req.body.searchtext;
    }

    let searchPublisher = null;
    searchPublisher = await publisherController.getIDBySearchText(searchText);
    let searchAuthor = null;
    searchAuthor = await authorController.getIDBySearchText(searchText);
    let searchCategory = null;
    searchCategory = await categoryController.getIDBySearchText(searchText);

        //Sap xep
        let sortType = "release_date";
        let sortOrder = "-1";
        if (typeof req.body.sorttype !== 'undefined') {
            sortType = req.body.sorttype;
        }
        if (typeof req.body.sortorder !== 'undefined') {
            sortOrder = req.body.sortorder;
        }
        if ((sortType !== "price")
            && (sortType !== "release_date")
            && (sortType !== "view_counts")
            && (sortType !== "sales")) {
            res.status(422).json({ msg: 'Invalid sort type' });
            return;
        }
        if ((sortOrder !== "1")
            && (sortOrder !== "-1")) {
            res.status(422).json({ msg: 'Invalid sort order' });
            return;
        }

    let bookCount = null;
    try {
        if (range !== null) {
            bookCount = await book
                .count({ $or: [{ name: new RegExp(searchText, "i") }, { id_nsx: { $in: searchPublisher } }, { id_author: { $in: searchAuthor } }, { id_category: { $in: searchCategory } }], price: { $gte: objRange.low, $lte: objRange.high } });
        }
        else {
            bookCount = await book.count({ $or: [{ name: new RegExp(searchText, "i") }, { id_nsx: { $in: searchPublisher } }, { id_author: { $in: searchAuthor } }, { id_category: { $in: searchCategory } }] });
        }
    }
    catch (err) {
        res.status(500).json({ msg: err });
       return;
    }
 
        //De sort
    let sortQuery = {}
    sortQuery[sortType] = sortOrder;
    if (range !== null) {
        book
          .find({ $or: [{ name: new RegExp(searchText, "i") }, { id_nsx: { $in: searchPublisher } }, { id_author: { $in: searchAuthor } }, { id_category: { $in: searchCategory } }], price: { $gte: objRange.low, $lte: objRange.high } })
          .sort(sortQuery)
          .lean()
          .then(docs => {
            res.status(200).json({ data: docs });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ msg: err });
          });
      } else {
        book
          .find({ $or: [{ name: new RegExp(searchText, "i") }, { id_nsx: { $in: searchPublisher } }, { id_author: { $in: searchAuthor } }, { id_category: { $in: searchCategory } }] })
          .sort(sortQuery)
          .lean()
          .then(docs => {
            res.status(200).json({ data: docs });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ msg: err });
          });
      }
 
}


exports.getBookByCategory = async (req, res) => {
    if (typeof req.body.id === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let id = req.body.id;
    //Khoang gia
    let range = null;
    let objRange = null;
    console.log(req.body.range)
    if (typeof req.body.range !== 'undefined') {
        range = req.body.range;
        objRange = range;
    }
    //Kiem tra text
    let searchText = "";
    if (typeof req.body.searchtext !== 'undefined') {
        searchText = req.body.searchtext;
    }

    //Sap xep
    let sortType = "release_date";
    let sortOrder = "-1";
    if (typeof req.body.sorttype !== 'undefined') {
        sortType = req.body.sorttype;
    }
    if (typeof req.body.sortorder !== 'undefined') {
        sortOrder = req.body.sortorder;
    }
    if ((sortType !== "price")
        && (sortType !== "release_date")
        && (sortType !== "view_counts")
        && (sortType !== "sales")) {
        res.status(422).json({ msg: 'Invalid sort type' });
        return;
    }
    if ((sortOrder !== "1")
        && (sortOrder !== "-1")) {
        res.status(422).json({ msg: 'Invalid sort order' });
        return;
    }

    //De sort
    let sortQuery = {}
    sortQuery[sortType] = sortOrder;
    //Lay du lieu

        if (range === null) {
            book
          .find({ id_category: id, name: new RegExp(searchText, "i") })
          .sort(sortQuery)
          .lean()
          .then(docs => {
            res.status(200).json({ data: docs });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ msg: err });
          });
        } else {
            book
            .find({ id_category: id, name: new RegExp(searchText, "i"), price: { $gte: objRange.low, $lte: objRange.high } })
            .sort(sortQuery)
            .lean()
            .then(docs => {
              res.status(200).json({ data: docs });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({ msg: err });
            });
        }
    
}


exports.getBookByAuthor = async (req, res) => {
    if (typeof req.body.id === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let id = req.body.id;
    //Khoang gia
    let range = null;
    let objRange = null;
    console.log(req.body.range)
    if (typeof req.body.range !== 'undefined') {
        range = req.body.range;
        objRange = range;
    }
    //Kiem tra text
    let searchText = "";
    if (typeof req.body.searchtext !== 'undefined') {
        searchText = req.body.searchtext;
    }

    //Sap xep
    let sortType = "release_date";
    let sortOrder = "-1";
    if (typeof req.body.sorttype !== 'undefined') {
        sortType = req.body.sorttype;
    }
    if (typeof req.body.sortorder !== 'undefined') {
        sortOrder = req.body.sortorder;
    }
    if ((sortType !== "price")
        && (sortType !== "release_date")
        && (sortType !== "view_counts")
        && (sortType !== "sales")) {
        res.status(422).json({ msg: 'Invalid sort type' });
        return;
    }
    if ((sortOrder !== "1")
        && (sortOrder !== "-1")) {
        res.status(422).json({ msg: 'Invalid sort order' });
        return;
    }

    //De sort
    let sortQuery = {}
    sortQuery[sortType] = sortOrder;
    //Lay du lieu

        if (range === null) {
            book
          .find({ id_author: id, name: new RegExp(searchText, "i") })
          .sort(sortQuery)
          .lean()
          .then(docs => {
            res.status(200).json({ data: docs });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ msg: err });
          });
        } else {
            book
            .find({ id_author: id, name: new RegExp(searchText, "i"), price: { $gte: objRange.low, $lte: objRange.high } })
            .sort(sortQuery)
            .lean()
            .then(docs => {
              res.status(200).json({ data: docs });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({ msg: err });
            });
        }
    
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


exports.createComment = async (req, res, next) => {
  const bookId = req.params.id;

  try {
      const token = req.headers.authorization.split(" ")[1];
      const { content, score } = req.body;
      const decoded = jwtDecode(token);

      const newComment = await commentModel({
        content: content,
        score: score,
        book_id: bookId,
        user_id: decoded.id,
      });
      await newComment.save();
      
      await book.updateOne(
        { _id: bookId }, 
        { $push: { comments: newComment._id } });
      return res.status(200).json(newComment);
  } catch (error) {
      console.log("Error creating comment");
      return res.status(500).json(error);
  }
}