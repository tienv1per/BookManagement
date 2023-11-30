const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'book',
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  score: {
    type: Number,
    required: true,
  },
}, {timestamps: true});

const Comment = mongoose.model('Comments', commentSchema);

module.exports = Comment;
