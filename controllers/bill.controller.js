
const bill = require("../models/bill.model");
const book = require("../models/book.model");
const cart = require("../models/cart.model");
const randomstring = require("randomstring");
// const nodemailer = require("../utils/nodemailer");


exports.addBill = async (req, res) => {
    if (
      typeof req.body.id_user === "undefined" ||
      typeof req.body.address === "undefined" ||
      typeof req.body.phone === "undefined" ||
      typeof req.body.name === "undefined" ||
      typeof req.body.total === "undefined" ||
      typeof req.body.email === "undefined" ||
      typeof req.body.id_product === "undefined"
    ) {
      res.status(422).json({ msg: "Invalid data" });
      return;
    }
  
    const { id_user, address, total, phone, name, email, id_product } = req.body;
  
    try {
      // Kiểm tra xem giỏ hàng của người dùng có tồn tại không
      const cartFind = await cart.findOne({ id_user: id_user });
  
      if (cartFind === null) {
        res.status(404).json({ msg: "Cart not found" });
        return;
      }
  
      // Tìm thông tin sản phẩm theo id_product
      const product_info = await book.findOne({ _id: id_product });
  
      // Kiểm tra xem sản phẩm có tồn tại không
      if (product_info === null) {
        res.status(404).json({ msg: "Product not found" });
        return;
      }
  
      // Tạo mã token ngẫu nhiên cho hóa đơn
      const token = randomstring.generate();
      const productIndex = cartFind.products.findIndex(
        (element) => element._id === id_product
      );
    //   console.log(cartFind.products[productIndex].count);
      // Tạo đối tượng hóa đơn mới
      const new_bill = new bill({
        id_user: id_user,
        products: { id_category: product_info.id_category,
            name: product_info.name,
            price: product_info.price,
            release_date: product_info.release_date,
            img: product_info.img,
            describe: product_info.describe,
            id_nsx: product_info.id_nsx,
            count: cartFind.products[productIndex].count}, // Sử dụng mảng để chứa thông tin sản phẩm và số lượng
        address: address,
        phone: phone,
        name: name,
        email: email,
        total: total,
        token: token,
        // count: cartFind.products[productIndex].count
      });
  
      // Lưu hóa đơn vào cơ sở dữ liệu
      await new_bill.save();
  
      // Xóa sản phẩm từ giỏ hàng sau khi tạo hóa đơn
 
  
      if (productIndex !== -1) {
        cartFind.products.splice(productIndex, 1);
        await cartFind.save();
      }
  
      // Trả về thành công
      res.status(201).json({ msg: "Success" });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };
  

exports.verifyPayment = async (req, res) => {
  if (typeof req.params.token === "undefined") {
    res.status(402).json({ msg: "!invalid" });
    return;
  }
  let token = req.params.token;
  let tokenFind = null;
  try {
    tokenFind = await bill.findOne({ token: token });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (tokenFind == null) {
    res.status(404).json({ msg: "not found!!!" });
    return;
  }
  try {
    await bill.findByIdAndUpdate(
      tokenFind._id,
      { $set: { issend: "99" } },
      { new: "99" }
    );
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ msg: "success!" });
};

exports.getBillByIDUser = async (req, res) => {
  if (typeof req.params.id_user === "undefined") {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let billFind = null;
  try {
    billFind = await bill
      .find({ id_user: req.params.id_user })
      .sort({ date: -1 });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }

  res.status(200).json({ data: billFind });
};


exports.deleteBill = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let billFind = null;
  try {
    billFind = await bill.findOne({ _id: req.params.id, issend: "99" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "server found" });
    return;
  }
  if (billFind === null) {
    res.status(400).json({ msg: "invalid" });
    return;
  }
  try {
    await bill.deleteOne({ _id: req.params.id, issend: "99" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "server found" });
    return;
  }
  res.status(200).json({ msg: "success" });
};



exports.statisticaRevenueDay = async (req, res) => {
  if (
    typeof req.body.day === "undefined" ||
    typeof req.body.month === "undefined" ||
    typeof req.body.year === "undefined"
  ) {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let { day, month, year } = req.body;
  let billFind = null;
  try {
    billFind = await bill.find({
      date: {
        $gte: new Date(year, month - 1, day),
        $lt: new Date(year, month - 1, parseInt(day) + 1),
      },
      issend: "1",
    });
  } catch (err) {
    console.log(err);
    res.status(500).msg({ msg: err });
    return;
  }
  res.status(200).json({ data: billFind });
};

exports.statisticaRevenueMonth = async (req, res) => {
  if (
    typeof req.body.year === "undefined" ||
    typeof req.body.month === "undefined"
  ) {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let { month, year } = req.body;
  let billFind = null;
  try {
    billFind = await bill.find({
      date: {
        $gte: new Date(year, parseInt(month) - 1, 1),
        $lt: new Date(year, month, 1),
      },
      issend: "1",
    });
  } catch (err) {
    console.log(err);
    res.status(500).msg({ msg: err });
    return;
  }
  res.status(200).json({ data: billFind });
};


exports.statisticaRevenueYear = async (req, res) => {
  if (typeof req.body.year === "undefined") {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  let { year } = req.body;
  let billFind = null;
  try {
    billFind = await bill.find({
      date: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1),
      },
      issend: "1",
    });
  } catch (err) {
    console.log(err);
    res.status(500).msg({ msg: err });
    return;
  }
  res.status(200).json({ data: billFind });
};



exports.getBillNoVerify = async (req, res) => {
  try {
    const count = await bill.countDocuments({ issend: "99" });
    const totalPage = parseInt((count - 1) / 9 + 1);
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
      res.status(200).json({ data: [], msg: "Invalid page", totalPage });
      return;
    }

    const docs = await bill
      .find({ issend: "99" })
      .skip(9 * (parseInt(page) - 1))
      .limit(9);

    res.status(200).json({ data: docs, totalPage });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getBillVerify = async (req, res) => {
  try {
    const count = await bill.countDocuments({ issend: "1" });
    const totalPage = parseInt((count - 1) / 9 + 1);
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
      res.status(200).json({ data: [], msg: "Invalid page", totalPage });
      return;
    }

    const docs = await bill
      .find({ issend: "1" })
      .skip(9 * (parseInt(page) - 1))
      .limit(9);

    res.status(200).json({ data: docs, totalPage });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getProcessing = async (req, res) => {
  try {
    const count = await bill.countDocuments({ issend: "0" });
    const totalPage = parseInt((count - 1) / 9 + 1);
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
      res.status(200).json({ data: [], msg: "Invalid page", totalPage });
      return;
    }

    const docs = await bill
      .find({ issend: "0" })
      .skip(9 * (parseInt(page) - 1))
      .limit(9);

    res.status(200).json({ data: docs, totalPage });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};




exports.updateIssend = async (req, res) => {
  if (
    typeof req.body.issend === "undefined" ||
    typeof req.body.id === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let id = req.body.id;
  let issend = req.body.issend;
  let billFind;
  try {
    billFind = await bill.findById(id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (billFind === null) {
    res.status(422).json({ msg: "not found" });
    return;
  }

  billFind.issend = issend;
  try {
    await billFind.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  res.status(201).json({ msg: "success", bill: { issend: issend } });
};
