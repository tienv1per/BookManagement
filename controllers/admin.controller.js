
const book = require("../models/book.model");
const user = require("../models/users");
const category = require("../models/category.model");
const author = require("../models/author.model");
const publisher = require("../models/publisher.model");
// const nxs = require("../models/nsx.model");
const fs = require('fs');
const path = require('path');

// const uploadImg = async (path) => {
//   let res;
//   try {
//     res = await cloudinary.uploader.upload(path);
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
//   return res.secure_url;
// };
const uploadImg = async (file) => {
  // Đảm bảo file không rỗng
  if (!file) {
    console.log('Không có tệp tin để tải lên.');
    return false;
  }

  const uploadDirectory = 'uploads'; // Thay đổi đường dẫn thư mục lưu trữ của bạn

  // Tạo thư mục nếu nó chưa tồn tại
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
  }

  const filename = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDirectory, filename);

  try {
    // Sử dụng stream để ghi file lên máy cục bộ
    const fileStream = fs.createWriteStream(filePath);
    fileStream.write(file.buffer);
    fileStream.end();
  } catch (err) {
    console.log(err);
    return false;
  }

  // Trả về đường dẫn tới tệp tin đã được lưu trữ cục bộ
  return filePath;
};

exports.addBook = async (req, res) => {
    // if (
    //   typeof req.file === "undefined" ||
    //   typeof req.body.name === "undefined" ||
    //   typeof req.body.id_category === "undefined" ||
    //   typeof req.body.price === "undefined" ||
    //   typeof req.body.release_date === "undefined" ||
    //   typeof req.body.describe === "undefined" ||
    //   typeof req.body.id_nsx === "undefined" ||
    //   typeof req.body.id_author === "undefined"
    // ) {
    //   console.log(req.body.name);
    //   res.status(422).json({ msg: "Invalid data" });
    //   return;
    // }
    const {
      id_category,
      name,
      price,
      release_date,
      describe,
      id_nsx,
      id_author,
    } = req.body;
    console.log(id_category, name, price,release_date,describe,id_nsx, id_author);
    let urlImg = await uploadImg(req.file.path);
    if (urlImg === false) {
      res.status(500).json({ msg: "server error" });
      return;
    }
    const newBook = new book({
      id_category: id_category,
      name: name,
      price: price,
      release_date: release_date,
      img: urlImg,
      describe: describe,
      id_nsx: id_nsx,
      id_author: id_author,
    });
    try {
      newBook.save();
    } catch (err) {
      res.status(500).json({ msg: "server error" });
      return;
    }
    fs.unlink(req.file.path, (err) => {
      if (err) throw err;
    });
    res.status(201).json({ msg: "success" });
  };

  exports.updateBook = async (req, res) => {
    if (
      typeof req.body.name === "undefined" ||
      typeof req.body.id === "undefined" ||
      typeof req.body.id_category === "undefined" ||
      typeof req.body.price === "undefined" ||
      typeof req.body.release_date === "undefined" ||
      typeof req.body.describe === "undefined"
    ) {
      res.status(422).json({ msg: "Invalid data" });
      return;
    }
    let { name, id, id_category, price, release_date, describe, category } =
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
    let urlImg = null;
    if (typeof req.file !== "undefined") {
      urlImg = await uploadImg(req.file.path);
    }
    if (urlImg !== null) {
      if (urlImg === false) {
        res.status(500).json({ msg: "server error" });
        return;
      }
    }
    if (urlImg === null) urlImg = bookFind.img;
  
    bookFind.id_category = id_category;
    bookFind.name = name;
    bookFind.price = parseFloat(price);
    bookFind.release_date = release_date;
    bookFind.describe = describe;
    bookFind.category = category;
    bookFind.img = urlImg;
    bookFind.save((err, docs) => {
      if (err) {
        console.log(err);
      }
    });
  
    res.status(200).json({ msg: "success", data: bookFind });
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
  