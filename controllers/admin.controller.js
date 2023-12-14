
const book = require("../models/book.model");
const user = require("../models/users");
const category = require("../models/category.model");
const author = require("../models/author.model");
const publisher = require("../models/publisher.model");
const nsx = require("../models/nsx.model");
const fs = require('fs');
const path = require('path');

exports.addBook = async (req, res) => {
  const {
    id_category,
    name,
    price,
    release_date,
    urlImg, 
    describe,
    id_nsx,
    id_author,
  } = req.body;
  console.log(id_category, name, price, release_date,urlImg, describe, id_nsx, id_author);

  // Check if required fields are present
  if (
    typeof name === "undefined" ||
    typeof id_category === "undefined" ||
    typeof price === "undefined" ||
    typeof release_date === "undefined" ||
    typeof urlImg === "undefined" ||
    typeof describe === "undefined" ||
    typeof id_nsx === "undefined" ||
    typeof id_author === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }

  // Validate release_date as a date
  if (isNaN(Date.parse(release_date))) {
    res.status(422).json({ msg: "Invalid release_date format" });
    return;
  }

  // Create a new book instance
  const newBook = new book({
    id_category,
    name,
    price,
    release_date,
    img: urlImg, // Change to img to match your schema
    describe,
    id_nsx,
    id_author,
  });

  try {
    await newBook.save();
    res.status(201).json({ msg: "Book added successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

  
  exports.updateBook = async (req, res) => {
    if (
      typeof req.body.name === "undefined" ||
      typeof req.params.id === "undefined" ||
      typeof req.body.id_category === "undefined" ||
      typeof req.body.price === "undefined" ||
      typeof req.body.release_date === "undefined" ||
      typeof req.body.describe === "undefined"
    ) {
      res.status(422).json({ msg: "Invalid data" });
      return;
    }
  
    console.log(1);
    let id = req.params.id;
    let { name, id_category, price, release_date, describe, category, urlImg } =
      req.body;
  
    let bookFind;
  
    try {
      bookFind = await book.findById(id);
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err });
      return;
    }
  
    if (bookFind === null) {
      res.status(404).json({ msg: "Not found" });
      return;
    }
  
    bookFind.id_category = id_category;
    bookFind.name = name;
    bookFind.price = parseFloat(price);
    bookFind.release_date = release_date;
    bookFind.describe = describe;
    bookFind.category = category;
    bookFind.img = urlImg;
  
    try {
      await bookFind.save();
      res.status(200).json({ msg: "success", data: bookFind });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Error saving data" });
    }
  };
  
  exports.deletebook = async (req, res) => {
    if (typeof req.params.id === "undefined") {
      res.status(422).json({ msg: "Invalid data" });
      return;
    }
    let bookFind;
    try {
      bookFind = await book.findById(req.params.id);
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err });
      return;
    }
    await bookFind.deleteOne();
    res.status(200).json({ msg: "success" });
  };
  
