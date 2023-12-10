
const cart = require("../models/cart.model");
const book = require("../models/book.model");
exports.addToCart = async (req, res) => {
  if (
    typeof req.body.id_user === "undefined" ||
    typeof req.body.id_product === "undefined" ||
    typeof req.body.count === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }

  const { id_user, id_product, count } = req.body;

  try {
    let cartFind = await cart.findOne({ id_user: id_user });
    let product_info = await book.findById(id_product);

    if (cartFind === null) {
      // Nếu giỏ hàng không tồn tại, tạo giỏ hàng mới
      const cart_new = new cart({
        id_user: id_user,
        products: [
          {
            id_category: product_info.id_category,
            name: product_info.name,
            price: product_info.price,
            release_date: product_info.release_date,
            img: product_info.img,
            describe: product_info.describe,
            id_nsx: product_info.id_nsx,
            count: count,
            _id: product_info._id.toString(),
          },
        ],
      });

      try {
        await cart_new.save();
        res.status(200).json({ msg: 'Product(s) added to cart successfully' });
      } catch (err) {
        res.status(500).json({ msg: err });
      }

      return;
    }

    // Nếu giỏ hàng đã tồn tại, cập nhật thông tin sản phẩm
    let productIndex = cartFind.products.findIndex(
      (element) => element._id === id_product
    );

    if (productIndex === -1) {
      // Nếu sản phẩm không tồn tại trong giỏ hàng, thêm mới vào mảng products
      cartFind.products.push({
        id_category: product_info.id_category,
        name: product_info.name,
        price: product_info.price,
        release_date: product_info.release_date,
        img: product_info.img,
        describe: product_info.describe,
        id_nsx: product_info.id_nsx,
        count: count,
        _id: product_info._id.toString(),
      });
    } else {
      // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng
      cartFind.products[productIndex].count += Number(count);
    }

    // Lưu lại giỏ hàng sau khi cập nhật thông tin sản phẩm
    try {
      await cartFind.save();
      res.status(200).json({ msg: 'Product(s) added to cart successfully' });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
}




  exports.getAll = async (req, res) => {
    try {
      if (typeof req.params.id_user === "undefined") {
        res.status(422).json({ msg: "invalid data" });
        return;
      }
  
      const docs = await cart.findOne({ id_user: req.params.id_user }).exec();
  
      if (!docs) {
        res.status(404).json({ msg: "No data found" });
        return;
      }
  
      res.status(200).json({ data: docs });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };


  exports.update = async (req, res) => {
    if (
      typeof req.body.id_user === "undefined" ||
      typeof req.body.id_product === "undefined" ||
      typeof req.body.count === "undefined"
    ) {
      res.status(422).json({ msg: "invalid data" });
      return;
    }
  
    const { id_user, id_product, count } = req.body;
  
    try {
      let cartFind = await cart.findOne({ id_user: id_user });
  
      if (cartFind === null) {
        // Nếu giỏ hàng không tồn tại, trả về mã lỗi 404
        res.status(404).json({ msg: 'Cart not found' });
        return;
      }
  
      // Tìm kiếm sản phẩm trong mảng products của giỏ hàng
      let index = cartFind.products.findIndex(
        (element) => element._id === id_product
      );
  
      if (index === -1) {
        // Nếu sản phẩm không tồn tại trong giỏ hàng, trả về mã lỗi 404
        res.status(404).json({ msg: 'Product not found in cart' });
        return;
      }
  
      // Cập nhật số lượng của sản phẩm
      cartFind.products[index].count = Number(count);
  
      // Lưu lại giỏ hàng sau khi cập nhật thông tin sản phẩm
      try {
        await cartFind.save();
        res.status(200).json({ msg: 'Update success' });
      } catch (err) {
        res.status(500).json({ msg: err });
      }
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  };
  

  exports.delete = async (req, res) => {
    if (
      typeof req.body.id_user === "undefined" ||
      typeof req.body.id_product === "undefined"
    ) {
      res.status(422).json({ msg: "invalid data" });
      return;
    }
    const { id_user, id_product } = req.body;
  
    try {
      let cartFind = await cart.findOne({ id_user: id_user });
  
      if (cartFind === null) {
        // Nếu giỏ hàng không tồn tại, trả về mã lỗi 404
        res.status(404).json({ msg: 'Cart not found' });
        return;
      }
  
      // Tìm kiếm sản phẩm trong mảng products của giỏ hàng
      let index = cartFind.products.findIndex(
        (element) => element._id === id_product
      );
  
      if (index === -1) {
        // Nếu sản phẩm không tồn tại trong giỏ hàng, trả về mã lỗi 404
        res.status(404).json({ msg: 'Product not found in cart' });
        return;
      }
  
      // Xóa sản phẩm khỏi mảng products
      cartFind.products.splice(index, 1);
  
      // Lưu lại giỏ hàng sau khi xóa sản phẩm
      try {
        await cartFind.save();
        res.status(200).json({ msg: 'Delete success' });
      } catch (err) {
        res.status(500).json({ msg: err });
      }
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  };
  

exports.removeCartByIDUser = async (id_user) => {
  try {
    cartFind = await cart.findOne({ id_user: id_user });
  } catch (err) {
    console.log(err)
    return false;
  }
  try {
    await cartFind.remove();
  }
  catch(err) {
    console.log(err);
    return false;
  }
  return true;
}
