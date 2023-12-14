const { jwtDecode } = require('jwt-decode');
const author = require('../models/author.model');
const category = require('../models/category.model');
const nsx = require('../models/nsx.model');
const book = require('../models/book.model');
const commentModel = require("../models/comment");
const publisherController = require('../controllers/publisher.controller');
const authorController = require('../controllers/author.controller');
const nsxController = require('../controllers/nsx.controller');
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
    if (req.params.id === 'undefined') {
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

    if (!result) {
        res.status(404).json({ msg: "not found" });
        return;
    }

    try {
        // Tăng giá trị của view_counts
        result.view_counts += 1;
        await result.save();
        console.log(result.id_author);
        // // Lấy thông tin tác giả, danh mục
        const authorInfo = await author.findById(result.id_author);

        const nsxInfo = await nsx.findById(result.id_nsx); 
        const categoryInfo = await category.findById(result.id_category);


        // Trả về thông tin sách
        res.status(200).json({
            "id": result._id,
            "release_date": result.release_date,
            "describe": result.describe,
            "view_counts": result.view_counts,
            "sales": result.sales,
            "category": categoryInfo.name,
            "name": result.name,
            "price": result.price,
            "img": result.img,
            "nsx": nsxInfo.name,
            "author": authorInfo.name,
            "comments": []
        });
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
  const token = req.headers.authorization.split(" ")[1];

  try {
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

exports.deleteComment = async (req, res, next) => {
    const id = req.params.id;
    try {
        const comment = await commentModel.findByIdAndDelete(id);
        const bookFound = await book.findById(comment.book_id);
        const updatedComments = bookFound.comments.filter(commentId => commentId.toString() !== id);
        bookFound.comments = updatedComments;
        await bookFound.save();

        return res.status(200).json({
            success: true,
            message: "Delete comment successfully",
            comment: comment,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.updateComment = async (req, res, next) => {
  const id = req.params.id;
  const updateData = req.body;
  const token = req.headers.authorization.split(" ")[1];
  const decode = jwtDecode(token);

  try {
    const findComment = await commentModel.findById(id);
    if(findComment.user_id !== decode.id) {
      return res.status(401).json("You dont have permission to delete this comment");
    }
    const comment = await commentModel.findByIdAndUpdate(
      id,
      {$set: updateData},
      {new: true}
    );

    return res.status(200).json({
      comment: comment,
      message: "Update comment successfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.getAllCommentsByBook = async (req, res, next) => {
  const bookId = req.params.id;

  try {
    const comments = await commentModel.find({ book_id: bookId }).populate({
        path: 'user_id',
        model: 'Users', 
        select: 'name email',
        as: 'user', 
    });

    return res.status(200).json({
        success: true,
        message: "Get comments successfully",
        comments: comments,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};