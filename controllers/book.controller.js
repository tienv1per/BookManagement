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
    // Search Text
    let searchText = req.query.searchtext || "";

    // Search Author
    let searchAuthor = req.query.author || [];
    if (!Array.isArray(searchAuthor)) {
        searchAuthor = [searchAuthor];
    }
    searchAuthor = await Promise.all(searchAuthor.map(async Author => await authorController.getIDBySearchText(Author)));

    // // Search Category
    let searchCategory = req.query.category || [];
    if (!Array.isArray(searchCategory)) {
        searchCategory = [searchCategory];
    }
    searchCategory = await Promise.all(searchCategory.map(async category => await categoryController.getIDBySearchText(category)));

    // // Search NSX
    let searchnsx = req.query.nsx || [];
    if (!Array.isArray(searchnsx)) {
        searchnsx = [searchnsx];
    }
    searchnsx = await Promise.all(searchnsx.map(async nsx => await nsxController.getIDBySearchText(nsx)));
 
    try {
        let query = {};
    
        if (searchText !== "") {
            query.name = new RegExp(searchText, "i");
        }
    
        if (Array.isArray(searchAuthor) && searchAuthor.length > 0) {
            query.id_author = { $in: searchAuthor.flat() };
        }
    
        if (Array.isArray(searchCategory) && searchCategory.length > 0) {
            query.id_category = { $in: searchCategory.flat() };
        }
    
        if (Array.isArray(searchnsx) && searchnsx.length > 0) {
            query.id_nsx = { $in: searchnsx.flat() };
        }
    
        let books;
        console.log(query);
    
        if (Object.keys(query).length > 0) {
            books = await book
                .find(query)
                .lean();
        } else {
            // If no search query, return all books
            books = await book.find().lean();
        }
    
        res.status(200).json({ data: books });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
    
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

  try {
      const { content, score, user_id } = req.body;

      const newComment = await commentModel({
        content: content,
        score: score,
        book_id: bookId,
        user_id: user_id,
      });
      await newComment.save();
      await book.updateOne(
        { _id: bookId }, 
        { $push: { comments: newComment._id } });
      return res.status(200).json(newComment);
  } catch (error) {
      console.log("Error creating comment", error);
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
  const {user_id, ...updateData} = req.body;

  try {
    const findComment = await commentModel.findById(id);
    if(findComment.user_id.toString() !== user_id) {
      return res.status(401).json("You dont have permission to edit this comment");
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